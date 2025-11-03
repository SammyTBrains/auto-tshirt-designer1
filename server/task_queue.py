import logging
import copy
from datetime import datetime, timedelta
import uuid
from typing import Optional, Dict, List, Tuple, Any, Set
import aiohttp
import asyncio
import os
from pathlib import Path
import base64
from server.models import Task, DesignRequest, TaskStatus
import json
from server.utils import serialize_datetime
from PIL import Image
import io
import time
from dotenv import load_dotenv

try:
    from huggingface_hub import InferenceClient  # type: ignore
except ImportError:  # pragma: no cover - library is optional at runtime
    InferenceClient = None

logger = logging.getLogger(__name__)

class TaskQueue:
    def __init__(self, config_service: Optional[Any] = None):
        self.tasks = {}  # type: Dict[str, Task]
        self.pending_tasks = []  # type: List[Task]
        self.processing_tasks = {}  # type: Dict[str, Task]
        self.completed_tasks = {}  # type: Dict[str, dict]
        self.failed_tasks = set()  # type: Set[str]
        self.task_timeout = 300  # 5 minutes
        self.config_service = config_service
        self._hf_settings: Dict[str, Any] = {}
        self.api_headers: Dict[str, str] = {"Accept": "image/png"}
        self.api_url = ""
        self.api_timeout = 120.0
        self.hf_model = "stabilityai/stable-diffusion-3.5-large"
        self.hf_provider: Optional[str] = None
        self.provider_config: Optional[Dict[str, Any]] = None
        self.inference_client = None

        # Load environment variables from server/.env so local runs pick up the token
        env_path = Path(__file__).parent / ".env"
        load_dotenv(dotenv_path=env_path, override=False)

        self._apply_env_defaults()

        if self.config_service:
            self.config_service.add_listener(self._on_config_updated)
        
        # Get root directory and set up outputs directory
        self.root_dir = Path(__file__).parent.parent.resolve()
        self.outputs_dir = self.root_dir / "outputs"
        self.outputs_dir.mkdir(exist_ok=True)
        
        logger.info(f"Outputs directory: {self.outputs_dir}")

    def _apply_env_defaults(self) -> None:
        """Load Hugging Face settings from environment as baseline."""

        default_model = "stabilityai/stable-diffusion-3.5-large"
        default_base_url = "https://router.huggingface.co/hf-inference/models"
        configured_base = os.getenv("HUGGINGFACE_API_BASE", default_base_url).rstrip("/")
        configured_model = os.getenv("HUGGINGFACE_MODEL", default_model).strip()
        token = os.getenv("HUGGINGFACE_TOKEN", "").strip()
        provider_raw = os.getenv("HUGGINGFACE_PROVIDER", "").strip()
        try:
            timeout = float(os.getenv("HUGGINGFACE_TIMEOUT", "120"))
        except ValueError:
            timeout = 120.0

        env_settings = {
            "base_url": configured_base,
            "model": configured_model or default_model,
            "token": token,
            "provider": provider_raw or None,
            "timeout": timeout,
        }
        self._hf_settings = env_settings
        self._configure_from_settings(env_settings)

    async def _on_config_updated(self, settings: Dict[str, Any]) -> None:
        huggingface_settings = settings.get("huggingface", {}) if settings else {}
        self._configure_from_settings(huggingface_settings or self._hf_settings)

    async def apply_settings(self, settings: Dict[str, Any]) -> None:
        """Explicitly apply new Hugging Face settings."""

        self._configure_from_settings(settings.get("huggingface", {}) if settings else {})

    def _configure_from_settings(self, huggingface_settings: Dict[str, Any]) -> None:
        settings = copy.deepcopy(self._hf_settings)
        settings.update({k: v for k, v in huggingface_settings.items() if v not in (None, "")})
        self._hf_settings = settings

        base_url = settings.get("base_url", "https://router.huggingface.co/hf-inference/models").rstrip("/")
        model = settings.get("model", "stabilityai/stable-diffusion-3.5-large").strip()
        token = (settings.get("token") or "").strip()
        provider_raw = (settings.get("provider") or "").strip()
        try:
            timeout = float(settings.get("timeout", 120.0))
        except (TypeError, ValueError):
            timeout = 120.0

        self.api_url = f"{base_url}/{model}" if model else base_url
        self.api_timeout = timeout
        self.hf_model = model or "stabilityai/stable-diffusion-3.5-large"
        self.api_headers = {"Accept": "image/png"}

        if token:
            self.api_headers["Authorization"] = f"Bearer {token}"
            logger.info("Hugging Face token configured (masked).")
        else:
            logger.warning("Hugging Face token missing; API generation will fail until it is set.")

        self.hf_provider = None
        self.provider_config = None
        if provider_raw:
            lowered = provider_raw.lower()
            if lowered not in {"auto", "default"}:
                if provider_raw.startswith("{"):
                    try:
                        parsed = json.loads(provider_raw)
                        if isinstance(parsed, dict):
                            self.provider_config = parsed
                            vendor = parsed.get("vendor")
                            if isinstance(vendor, str) and vendor:
                                self.hf_provider = vendor
                        else:
                            logger.warning("Hugging Face provider JSON must decode to an object. Ignoring value: %s", provider_raw)
                    except json.JSONDecodeError as exc:
                        logger.warning("Failed to parse Hugging Face provider JSON: %s", exc)
                else:
                    self.hf_provider = provider_raw
                    self.provider_config = {"vendor": provider_raw}

        if self.provider_config:
            logger.info("Using custom provider configuration: %s", self.provider_config)

        token_for_client = token
        self.inference_client = None
        if token_for_client and InferenceClient:
            client_kwargs: Dict[str, Any] = {
                "model": self.hf_model,
                "token": token_for_client,
                "timeout": self.api_timeout,
            }
            if self.hf_provider:
                client_kwargs["provider"] = self.hf_provider
            try:
                self.inference_client = InferenceClient(**client_kwargs)
                logger.info("Initialized Hugging Face InferenceClient for model %s", self.hf_model)
            except Exception as exc:
                logger.warning("Failed to initialize Hugging Face InferenceClient: %s", exc)
        elif token_for_client and not InferenceClient:
            logger.warning("huggingface_hub not installed; falling back to raw HTTP requests.")

    async def save_image(self, image_data: bytes, task_id: str) -> Tuple[str, str]:
        """Save image data to a file and return the filename and base64 data"""
        filename = f"{task_id}.png"
        filepath = self.outputs_dir / filename
        
        # Ensure the directory exists
        self.outputs_dir.mkdir(exist_ok=True)
        
        logger.info(f"Saving image to: {filepath}")
        try:
            # Convert image data to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Save as PNG
            with open(filepath, 'wb') as f:
                image.save(f, format='PNG', optimize=True)
            
            # Convert to base64
            base64_data = base64.b64encode(image_data).decode('utf-8')
            logger.info(f"Image converted to base64 (length: {len(base64_data)})")
            
            # Verify the file was saved
            if not filepath.exists():
                raise Exception(f"Failed to save image to {filepath}")
                
            logger.info(f"Image saved successfully: {filepath}")
            return filename, base64_data
            
        except Exception as e:
            logger.error(f"Error saving image: {str(e)}")
            raise

    async def try_api_generation(self, task: Task) -> Optional[bytes]:
        """Try to generate image using the API first"""
        prompt = task.request.get("prompt", "")
        if not prompt:
            return None

        if self.inference_client:
            try:
                def generate_image() -> bytes:
                    image = self.inference_client.text_to_image(
                        prompt=prompt,
                        negative_prompt="blurry, distorted, low quality",
                        guidance_scale=7.5,
                        num_inference_steps=30,
                        width=1024,
                        height=1024,
                        extra_body={"output_format": "png"},
                    )
                    buffer = io.BytesIO()
                    image.save(buffer, format="PNG")
                    return buffer.getvalue()

                return await asyncio.to_thread(generate_image)
            except Exception as exc:
                logger.warning("InferenceClient text_to_image failed: %s", exc)

        payload: Dict[str, Any] = {
            "inputs": prompt,
            "parameters": {
                "guidance_scale": 7.5,
                "negative_prompt": "blurry, distorted, low quality",
                "num_inference_steps": 30,
                "width": 1024,
                "height": 1024,
            },
        }
        if self.provider_config:
            payload["provider"] = self.provider_config

        timeout = aiohttp.ClientTimeout(total=self.api_timeout)
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(self.api_url, headers=self.api_headers, json=payload) as response:
                    if response.status != 200:
                        try:
                            error_preview = await response.text()
                        except Exception:
                            error_preview = "<no response body>"
                        logger.warning(
                            "API request failed with status %s: %s",
                            response.status,
                            error_preview[:500]
                        )
                        return None
                    
                    data = await response.content.read()
                    if data and len(data) > 0:
                        logger.info(f"Received image data from API (size: {len(data)} bytes)")
                        return data
                    return None
        except Exception as e:
            logger.error(f"API request failed: {str(e)}")
            return None

    async def add_task(self, request: DesignRequest) -> str:
        task_id = str(uuid.uuid4())
        task = Task(
            id=task_id,
            request=request.dict(),
            status=TaskStatus.PENDING,
            created_at=datetime.utcnow()
        )
        
        self.tasks[task_id] = task
        
        # Try API generation first
        logger.info(f"Attempting API generation for task {task_id}")
        task.status = TaskStatus.PROCESSING
        task.started_at = datetime.utcnow()
        
        api_result = await self.try_api_generation(task)
        if api_result:
            try:
                # Save the image and get base64 data
                filename, base64_data = await self.save_image(api_result, task_id)
                
                # API generation successful
                task.status = TaskStatus.COMPLETED
                task.completed_at = datetime.utcnow()
                task.result = {
                    "image_url": f"/images/{filename}",
                    "image_data": f"data:image/png;base64,{base64_data}",
                    "source": "api"
                }
                self.completed_tasks[task_id] = task.result
                logger.info(f"API generation successful for task {task_id}")
            except Exception as e:
                logger.error(f"Failed to save image for task {task_id}: {str(e)}")
                task.status = TaskStatus.FAILED
                task.result = {"error": str(e)}
                self.failed_tasks.add(task_id)
        else:
            task.status = TaskStatus.FAILED
            task.result = {"error": "API generation failed"}
            self.failed_tasks.add(task_id)
            logger.info(f"API generation failed for task {task_id}")
        
        return task_id

    async def get_next_task(self) -> Optional[Task]:
        """Get next task and mark it as processing"""
        if not self.pending_tasks:
            return None
            
        task = self.pending_tasks.pop(0)
        self.processing_tasks[task.id] = task
        task.status = TaskStatus.PROCESSING
        task.started_at = datetime.utcnow()
        
        logger.info(f"Task {task.id} moved to processing")
        return task

    async def get_task_status(self, task_id: str) -> Optional[dict]:
        task = self.tasks.get(task_id)
        if not task:
            return None
            
        # Check for stuck tasks
        if (task.status == TaskStatus.PROCESSING and 
            task.started_at and 
            datetime.utcnow() - task.started_at > timedelta(seconds=self.task_timeout)):
            task.status = TaskStatus.FAILED
            task.result = {"error": "Task timed out"}
            if task.id in self.processing_tasks:
                del self.processing_tasks[task.id]
            self.failed_tasks.add(task_id)
            
        return json.loads(json.dumps({
            "task_id": task.id,
            "status": task.status,
            "created_at": task.created_at,
            "started_at": task.started_at,
            "completed_at": task.completed_at,
            "result": task.result
        }, default=serialize_datetime))

    async def update_task_status(self, task_id: str, status: TaskStatus, result: Optional[dict] = None):
        task = self.tasks.get(task_id)
        if not task:
            logger.error(f"Task not found: {task_id}")
            return
            
        task.status = status
        if status == TaskStatus.COMPLETED:
            task.completed_at = datetime.utcnow()
            if result and isinstance(result, dict):
                # Make sure we have both image_url and image_data
                if 'image_data' in result and not result.get('image_url'):
                    filename = f"{task_id}.png"
                    result['image_url'] = f"/images/{filename}"
                elif 'image_url' in result and not result.get('image_data'):
                    try:
                        with open(self.outputs_dir / Path(result['image_url']).name, 'rb') as f:
                            image_data = f.read()
                            result['image_data'] = f"data:image/png;base64,{base64.b64encode(image_data).decode('utf-8')}"
                    except Exception as e:
                        logger.error(f"Error reading image data: {str(e)}")
                
                task.result = result
                self.completed_tasks[task_id] = result
        elif status == TaskStatus.FAILED:
            task.result = result or {"error": "Unknown error"}
            self.failed_tasks.add(task_id)
            
        logger.info(f"Updated task {task_id} status to {status}")

    async def cleanup_timed_out_tasks(self):
        """Clean up tasks that have timed out"""
        current_time = datetime.utcnow()
        
        for task_id, task in list(self.processing_tasks.items()):
            if (task.started_at and 
                current_time - task.started_at > timedelta(seconds=self.task_timeout)):
                
                task.status = TaskStatus.FAILED
                task.result = {"error": "Task timed out"}
                task.completed_at = current_time
                del self.processing_tasks[task_id]
                self.failed_tasks.add(task_id)

    def size(self) -> int:
        """Return the number of tasks in the queue."""
        return len(self.pending_tasks) + len(self.processing_tasks)

    def pending_count(self) -> int:
        """Return the number of pending tasks."""
        return len(self.pending_tasks)

    def processing_count(self) -> int:
        """Return the number of processing tasks."""
        return len(self.processing_tasks)

    async def wait_for_result(self, task_id: str, timeout: int = 30) -> Optional[dict]:
        """Wait for a task result with timeout.
        
        Args:
            task_id: The ID of the task to wait for
            timeout: Maximum time to wait in seconds
            
        Returns:
            The task result if available within timeout, None otherwise
        """
        start_time = time.time()
        while time.time() - start_time < timeout:
            # Check if task is completed
            if task_id in self.completed_tasks:
                return self.completed_tasks[task_id]
                
            # Check if task failed
            if task_id in self.failed_tasks:
                return None
                
            # Wait a bit before checking again
            await asyncio.sleep(0.5)
            
        # Timeout reached
        logger.warning(f"Task {task_id} timed out after {timeout} seconds")
        return None