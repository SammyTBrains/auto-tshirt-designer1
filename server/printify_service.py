"""Printify integration service with runtime configuration updates."""
from __future__ import annotations

import asyncio
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple

import httpx

from server.config_service import config_service

logger = logging.getLogger(__name__)


@dataclass
class PrintifyConfig:
    api_key: str = ""
    shop_id: str = ""
    print_provider_id: Optional[int] = None
    blueprint_id: Optional[int] = None
    default_shipping_method: int = 1
    print_area: str = "front"
    variant_map: Dict[str, int] | None = None


class PrintifyService:
    """Service wrapper for interacting with the Printify REST API."""

    def __init__(self) -> None:
        self.base_url = os.getenv("PRINTIFY_BASE_URL", "https://api.printify.com/v1").rstrip("/")
        self._config = PrintifyConfig(
            api_key=os.getenv("PRINTIFY_API_KEY", ""),
            shop_id=os.getenv("PRINTIFY_SHOP_ID", ""),
            print_provider_id=self._parse_int(os.getenv("PRINTIFY_PROVIDER_ID")),
            blueprint_id=self._parse_int(os.getenv("PRINTIFY_BLUEPRINT_ID")),
            default_shipping_method=self._parse_int(os.getenv("PRINTIFY_DEFAULT_SHIPPING_METHOD"))
            or 1,
            print_area=os.getenv("PRINTIFY_PRINT_AREA", "front"),
        )
        self._client_timeout = float(os.getenv("PRINTIFY_HTTP_TIMEOUT", "30"))
        self._lock = asyncio.Lock()
        config_service.add_listener(self._on_config_updated)

    @staticmethod
    def _parse_int(value: Optional[str]) -> Optional[int]:
        if value is None or value == "":
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    async def _on_config_updated(self, settings: Dict[str, Any]) -> None:
        branch = settings.get("printify", {}) if settings else {}
        async with self._lock:
            self._apply_branch(branch)

    def _apply_branch(self, branch: Dict[str, Any]) -> None:
        if not branch:
            return

        variant_map = branch.get("variant_map")
        if isinstance(variant_map, dict):
            safe_variant_map = {}
            for size, variant in variant_map.items():
                parsed = self._parse_int(str(variant)) if variant is not None else None
                if parsed is not None:
                    safe_variant_map[str(size).upper()] = parsed
            self._config.variant_map = safe_variant_map

        self._config.api_key = branch.get("api_key", self._config.api_key or "") or ""
        self._config.shop_id = branch.get("shop_id", self._config.shop_id or "") or ""
        provider_id = branch.get("print_provider_id")
        blueprint_id = branch.get("blueprint_id")
        shipping_method = branch.get("default_shipping_method")

        if provider_id is not None:
            self._config.print_provider_id = self._parse_int(str(provider_id))
        if blueprint_id is not None:
            self._config.blueprint_id = self._parse_int(str(blueprint_id))
        if shipping_method is not None:
            parsed_shipping = self._parse_int(str(shipping_method))
            if parsed_shipping is not None:
                self._config.default_shipping_method = parsed_shipping

        print_area = branch.get("print_area")
        if isinstance(print_area, str) and print_area:
            self._config.print_area = print_area

    def is_enabled(self) -> bool:
        return bool(self._config.api_key and self._config.shop_id)

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self._config.api_key}",
            "Content-Type": "application/json",
        }

    async def test_connection(self) -> Tuple[bool, Dict[str, Any]]:
        if not self.is_enabled():
            return False, {"error": "Printify integration is not configured"}

        url = f"{self.base_url}/shops.json"
        try:
            async with httpx.AsyncClient(timeout=self._client_timeout) as client:
                response = await client.get(url, headers=self._headers())
            if response.status_code == 200:
                data = response.json()
                return True, {"shops": data}
            return False, {"status": response.status_code, "detail": response.text}
        except Exception as exc:  # pragma: no cover - network variability
            logger.error("Printify connection test failed: %s", exc, exc_info=True)
            return False, {"error": str(exc)}

    async def submit_order(self, order: Any) -> Optional[Dict[str, Any]]:
        """Create a corresponding Printify order for the provided order model."""

        if not self.is_enabled():
            logger.info("Printify not configured; skipping fulfillment push")
            return None

        payload = self._build_order_payload(order)
        if not payload:
            logger.warning("Printify payload was empty; skipping order push")
            return None

        url = f"{self.base_url}/shops/{self._config.shop_id}/orders.json"
        try:
            async with httpx.AsyncClient(timeout=self._client_timeout) as client:
                response = await client.post(url, headers=self._headers(), json=payload)
            if response.status_code in (200, 201):
                data = response.json()
                logger.info("Order %s pushed to Printify", payload.get("external_id"))
                return data

            logger.error(
                "Printify order submission failed (status=%s): %s",
                response.status_code,
                response.text,
            )
            return None
        except Exception as exc:  # pragma: no cover - network variability
            logger.error("Printify order submission error: %s", exc, exc_info=True)
            return None

    def _build_order_payload(self, order: Any) -> Optional[Dict[str, Any]]:
        items = getattr(order, "items", None)
        if not items:
            return None

        line_items = []
        for item in items:
            variant_id = self._resolve_variant_id(item)
            if not variant_id:
                logger.warning("No variant mapping found for item size %s", getattr(item, "size", "?"))
                continue

            line_item: Dict[str, Any] = {
                "variant_id": variant_id,
                "quantity": getattr(item, "quantity", 1),
            }

            if self._config.blueprint_id:
                line_item["blueprint_id"] = self._config.blueprint_id
            if self._config.print_provider_id:
                line_item["print_provider_id"] = self._config.print_provider_id

            images = self._build_print_images(item)
            if images:
                line_item["print_areas"] = [
                    {
                        "placement": self._config.print_area,
                        "images": images,
                    }
                ]

            line_items.append(line_item)

        if not line_items:
            return None

        address = self._build_address(order)
        payload: Dict[str, Any] = {
            "external_id": getattr(order, "order_number", ""),
            "label": f"Order {getattr(order, 'order_number', '')}",
            "line_items": line_items,
            "shipping_method": self._config.default_shipping_method,
            "send_shipping_notification": False,
            "address_to": address,
        }
        return payload

    def _resolve_variant_id(self, item: Any) -> Optional[int]:
        direct_variant = getattr(item, "variant_id", None)
        if direct_variant:
            parsed = self._parse_int(str(direct_variant))
            if parsed:
                return parsed

        if self._config.variant_map:
            size = str(getattr(item, "size", "")).upper()
            mapped = self._config.variant_map.get(size)
            if mapped:
                return mapped

        design_data = getattr(item, "design_data", None) or {}
        variant_hint = design_data.get("variantId") if isinstance(design_data, dict) else None
        return self._parse_int(str(variant_hint)) if variant_hint is not None else None

    @staticmethod
    def _build_print_images(item: Any) -> list[Dict[str, Any]]:
        design_data = getattr(item, "design_data", None)
        if not isinstance(design_data, dict):
            return []

        image_url = design_data.get("imageUrl") or design_data.get("image_url")
        if not image_url:
            return []

        position = design_data.get("position") or {}
        scale = design_data.get("scale", 1)
        rotation = design_data.get("rotation", 0)

        return [
            {
                "type": "image",
                "url": image_url,
                "position": {
                    "x": position.get("x", 0),
                    "y": position.get("y", 0),
                    "scale": scale,
                    "angle": rotation,
                },
            }
        ]

    @staticmethod
    def _build_address(order: Any) -> Dict[str, Any]:
        shipping = getattr(order, "shipping_address", {}) or {}
        full_name = shipping.get("full_name") or "Customer"
        first_name, last_name = PrintifyService._split_name(full_name)

        return {
            "first_name": first_name,
            "last_name": last_name,
            "email": getattr(order, "contact_email", ""),
            "phone": getattr(order, "contact_phone", ""),
            "country": shipping.get("country", "US"),
            "region": shipping.get("state", ""),
            "address1": shipping.get("address_line1", ""),
            "address2": shipping.get("address_line2", ""),
            "city": shipping.get("city", ""),
            "zip": shipping.get("postal_code", ""),
        }

    @staticmethod
    def _split_name(full_name: str) -> Tuple[str, str]:
        if not full_name:
            return "Customer", ""
        parts = full_name.strip().split()
        if len(parts) == 1:
            return parts[0], ""
        return parts[0], " ".join(parts[1:])


printify_service = PrintifyService()
