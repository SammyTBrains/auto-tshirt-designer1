"""Runtime configuration service with caching and change notifications."""
from __future__ import annotations

import asyncio
import copy
import inspect
import logging
import os
from datetime import datetime, timedelta
from typing import Any, Awaitable, Callable, Dict, List, MutableMapping, Optional

from server.database import db

logger = logging.getLogger(__name__)

SettingsDict = Dict[str, Any]
ListenerType = Callable[[SettingsDict], Awaitable[None] | None]


def _deep_merge(base: MutableMapping[str, Any], updates: MutableMapping[str, Any]) -> MutableMapping[str, Any]:
    """Recursively merge ``updates`` into ``base`` and return the merged mapping."""

    for key, value in updates.items():
        if (
            key in base
            and isinstance(base[key], MutableMapping)
            and isinstance(value, MutableMapping)
        ):
            base[key] = _deep_merge(base[key], value)  # type: ignore[assignment]
        else:
            base[key] = value
    return base


def _mask_secret(value: Optional[str]) -> Optional[str]:
    if not value:
        return value
    trimmed = value.strip()
    if len(trimmed) <= 4:
        return "•" * len(trimmed)
    return f"{'•' * (len(trimmed) - 4)}{trimmed[-4:]}"


ENV_FALLBACKS = [
    (("stripe", "publishable_key"), "STRIPE_PUBLISHABLE_KEY", str),
    (("stripe", "secret_key"), "STRIPE_SECRET_KEY", str),
    (("smtp", "host"), "SMTP_HOST", str),
    (("smtp", "port"), "SMTP_PORT", int),
    (("smtp", "username"), "SMTP_USERNAME", str),
    (("smtp", "password"), "SMTP_PASSWORD", str),
    (("smtp", "from_email"), "SMTP_FROM_EMAIL", str),
    (("smtp", "from_name"), "SMTP_FROM_NAME", str),
    (("telegram", "bot_token"), "TELEGRAM_BOT_TOKEN", str),
    (("telegram", "chat_id"), "TELEGRAM_CHAT_ID", str),
    (("huggingface", "token"), "HUGGINGFACE_TOKEN", str),
    (("huggingface", "model"), "HUGGINGFACE_MODEL", str),
    (("huggingface", "base_url"), "HUGGINGFACE_API_BASE", str),
    (("huggingface", "timeout"), "HUGGINGFACE_TIMEOUT", float),
    (("huggingface", "provider"), "HUGGINGFACE_PROVIDER", str),
    (("printify", "api_key"), "PRINTIFY_API_KEY", str),
    (("printify", "shop_id"), "PRINTIFY_SHOP_ID", str),
    (("printify", "print_provider_id"), "PRINTIFY_PROVIDER_ID", int),
    (("printify", "blueprint_id"), "PRINTIFY_BLUEPRINT_ID", int),
    (("printify", "default_shipping_method"), "PRINTIFY_DEFAULT_SHIPPING_METHOD", int),
    (("printify", "print_area"), "PRINTIFY_PRINT_AREA", str),
]


def _apply_env_overrides(settings: SettingsDict) -> SettingsDict:
    for path, env_var, caster in ENV_FALLBACKS:
        raw_value = os.getenv(env_var)
        if raw_value is None:
            continue

        if isinstance(raw_value, str) and not raw_value.strip():
            continue

        # Walk down into nested dicts
        branch: MutableMapping[str, Any] = settings
        for key in path[:-1]:
            if key not in branch or not isinstance(branch[key], MutableMapping):
                branch[key] = {}
            branch = branch[key]  # type: ignore[assignment]

        leaf_key = path[-1]
        current_value = branch.get(leaf_key)

        should_override = current_value is None
        if isinstance(current_value, str):
            should_override = not current_value.strip()
        elif isinstance(current_value, (int, float)):
            should_override = current_value == 0

        if should_override:
            try:
                branch[leaf_key] = caster(raw_value)
            except (TypeError, ValueError):
                logger.warning("Invalid value for %s in environment: %s", env_var, raw_value)

    return settings


DEFAULT_SETTINGS: SettingsDict = {
    "stripe": {
        "publishable_key": "",
        "secret_key": "",
    },
    "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "username": "",
        "password": "",
        "from_email": "",
        "from_name": "AI Tees",
    },
    "telegram": {
        "bot_token": "",
        "chat_id": "",
    },
    "huggingface": {
        "token": "",
        "model": "stabilityai/stable-diffusion-3.5-large",
        "base_url": "https://router.huggingface.co/hf-inference/models",
        "timeout": 120.0,
        "provider": None,
    },
    "printify": {
        "api_key": "",
        "shop_id": "",
        "print_provider_id": None,
        "blueprint_id": None,
        "default_shipping_method": 1,
        "print_area": "front",
        "variant_map": {},  # size -> variant_id mapping
    },
    "features": {
        "marketplace_enabled": True,
        "design_export_enabled": True,
    },
}


class ConfigService:
    """Provides cached access to runtime configuration stored in MongoDB."""

    def __init__(self) -> None:
        self._cache: Optional[SettingsDict] = None
        self._cache_expiry: datetime = datetime.min
        self._lock = asyncio.Lock()
        self._listeners: List[ListenerType] = []

    def add_listener(self, listener: ListenerType) -> None:
        """Register a listener invoked whenever settings change."""

        self._listeners.append(listener)

    async def initialize(self, force_refresh: bool = True) -> SettingsDict:
        """Ensure settings are loaded and notify listeners once."""

        settings = await self.get_settings(force_refresh=force_refresh)
        await self._notify_listeners(settings)
        return settings

    async def get_settings(self, force_refresh: bool = False) -> SettingsDict:
        """Return current settings, pulling from DB if cache is stale."""

        if not force_refresh and self._cache and datetime.utcnow() < self._cache_expiry:
            return copy.deepcopy(self._cache)

        async with self._lock:
            if not force_refresh and self._cache and datetime.utcnow() < self._cache_expiry:
                return copy.deepcopy(self._cache)

            database = db.get_db()
            if database is None:
                logger.warning("Database unavailable while loading settings; using cached/default values")
                self._cache = copy.deepcopy(self._cache or DEFAULT_SETTINGS)
                self._cache_expiry = datetime.utcnow() + timedelta(seconds=30)
                return copy.deepcopy(self._cache)

            document = await database.settings.find_one({"_id": "runtime_config"})
            if not document:
                payload = copy.deepcopy(DEFAULT_SETTINGS)
                payload = _apply_env_overrides(payload)
                await database.settings.insert_one({"_id": "runtime_config", **payload})
                settings = payload
            else:
                document = dict(document)
                document.pop("_id", None)
                settings = _deep_merge(copy.deepcopy(DEFAULT_SETTINGS), document)
                settings = _apply_env_overrides(settings)

            self._cache = settings
            self._cache_expiry = datetime.utcnow() + timedelta(seconds=30)
            return copy.deepcopy(settings)

    async def update_settings(self, updates: SettingsDict) -> SettingsDict:
        """Merge updates into stored settings and notify listeners."""

        database = db.get_db()
        if database is None:
            raise RuntimeError("Database connection is not available; cannot update settings")

        async with self._lock:
            current = await self.get_settings(force_refresh=True)
            merged = _deep_merge(copy.deepcopy(current), copy.deepcopy(updates))
            merged = _apply_env_overrides(merged)
            await database.settings.update_one(
                {"_id": "runtime_config"},
                {"$set": merged},
                upsert=True,
            )
            self._cache = merged
            self._cache_expiry = datetime.utcnow() + timedelta(seconds=30)

        await self._notify_listeners(merged)
        return copy.deepcopy(merged)

    async def _notify_listeners(self, settings: SettingsDict) -> None:
        if not self._listeners:
            return

        for listener in list(self._listeners):
            try:
                result = listener(copy.deepcopy(settings))
                if inspect.isawaitable(result):
                    await result  # type: ignore[arg-type]
            except Exception as exc:  # pragma: no cover - defensive logging
                logger.error("Config listener %s failed: %s", listener, exc, exc_info=True)

    async def refresh_now(self) -> SettingsDict:
        """Force refresh of settings and notify listeners."""

        settings = await self.get_settings(force_refresh=True)
        await self._notify_listeners(settings)
        return settings

    def build_admin_payload(self, settings: Optional[SettingsDict] = None) -> SettingsDict:
        """Return settings formatted for the admin UI."""

        payload = copy.deepcopy(settings or self._cache or DEFAULT_SETTINGS)
        return payload

    def build_public_payload(self, settings: Optional[SettingsDict] = None) -> SettingsDict:
        """Return sanitized settings safe for unauthenticated clients."""

        source = copy.deepcopy(settings or self._cache or DEFAULT_SETTINGS)
        return {
            "stripe": {
                "publishable_key": source.get("stripe", {}).get("publishable_key", ""),
            },
            "features": source.get("features", {}),
        }

    def build_masked_payload(self, settings: Optional[SettingsDict] = None) -> SettingsDict:
        """Return settings with sensitive values replaced by masked versions."""

        src = copy.deepcopy(settings or self._cache or DEFAULT_SETTINGS)

        def mask_branch(branch: MutableMapping[str, Any], keys: List[str]) -> None:
            for key in keys:
                if key in branch:
                    branch[f"{key}_masked"] = _mask_secret(branch[key])
                    branch[key] = None

        if "stripe" in src:
            mask_branch(src["stripe"], ["secret_key", "publishable_key"])
        if "smtp" in src:
            mask_branch(src["smtp"], ["password", "username"])
        if "telegram" in src:
            mask_branch(src["telegram"], ["bot_token", "chat_id"])
        if "huggingface" in src:
            mask_branch(src["huggingface"], ["token"])
        if "printify" in src:
            mask_branch(src["printify"], ["api_key", "shop_id"])

        return src


config_service = ConfigService()
