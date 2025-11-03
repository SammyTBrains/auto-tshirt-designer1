"""Telegram bot service for admin notifications."""
from __future__ import annotations

import logging
import os
from typing import Any, Optional

from server.config_service import config_service

logger = logging.getLogger(__name__)


class TelegramService:
    """Service for sending Telegram notifications backed by runtime config."""

    def __init__(self) -> None:
        self.bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
        self._bot: Optional[Any] = None
        self._enabled = False
        self._telegram_import_error: Optional[str] = None

        self._configure_bot()
        config_service.add_listener(self._on_config_updated)

    def _configure_bot(self) -> None:
        if not (self.bot_token and self.chat_id):
            if self._enabled:
                logger.warning("Telegram bot credentials missing; disabling notifications.")
            self._bot = None
            self._enabled = False
            return

        try:
            from telegram import Bot
        except ImportError:
            self._bot = None
            self._enabled = False
            self._telegram_import_error = (
                "python-telegram-bot not installed. Install with: pip install python-telegram-bot"
            )
            logger.error(self._telegram_import_error)
            return

        try:
            self._bot = Bot(token=self.bot_token)
            self._enabled = True
            self._telegram_import_error = None
            logger.info("Telegram bot configured for chat %s", self.chat_id)
        except Exception as exc:  # pragma: no cover - network/remote issues
            self._bot = None
            self._enabled = False
            logger.error("Error initializing Telegram bot: %s", exc)

    async def _on_config_updated(self, settings: dict[str, Any]) -> None:
        branch = settings.get("telegram", {}) if settings else {}
        if not branch:
            return

        def coalesce(current: str, new_value: Any) -> str:
            if new_value is None:
                return current
            if isinstance(new_value, str) and not new_value.strip():
                return current
            return str(new_value)

        token = coalesce(self.bot_token, branch.get("bot_token"))
        chat_id = coalesce(self.chat_id, branch.get("chat_id"))

        if token != self.bot_token or chat_id != self.chat_id:
            self.bot_token = token
            self.chat_id = chat_id
            self._configure_bot()

    def is_enabled(self) -> bool:
        return self._enabled and self._bot is not None

    async def send_message(self, message: str) -> bool:
        if not self.is_enabled():
            if self._telegram_import_error:
                logger.warning(self._telegram_import_error)
            else:
                logger.warning("Telegram not configured, skipping message")
            return False

        try:
            await self._bot.send_message(chat_id=self.chat_id, text=message, parse_mode="HTML")
            logger.info("Telegram message sent")
            return True
        except Exception as exc:  # pragma: no cover - network/remote issues
            logger.error("Error sending Telegram message: %s", exc)
            return False

    async def notify_new_order(self, order_number: str, total_amount: float, items_count: int) -> bool:
        """Send notification about new paid order"""
        message = f"""
<b>New Order Received</b>

Order: <code>{order_number}</code>
Amount: ${total_amount:.2f}
Items: {items_count}
        """
        return await self.send_message(message.strip())

    async def notify_payment_received(self, order_number: str, amount: float) -> bool:
        """Send notification about a successful payment"""
        message = f"""
<b>Payment Received</b>

Order: <code>{order_number}</code>
Amount: ${amount:.2f}
        """
        return await self.send_message(message.strip())

    async def notify_payment_intent(self, order_number: str, amount: float, items_count: int) -> bool:
        """Notify when a payment intent is created (customer is about to pay)"""
        message = f"""
<b>Payment Intent Created</b>

Order: <code>{order_number}</code>
Amount: ${amount:.2f}
Items: {items_count}

<i>Customer is about to complete payment...</i>
        """
        return await self.send_message(message.strip())

    async def notify_trending_design(self, design_prompt: str, purchases: int) -> bool:
        """Send notification about a trending design"""
        message = f"""
<b>Trending Design</b>

Design: "{design_prompt}"
Purchases: {purchases}
        """
        return await self.send_message(message.strip())

    async def send_daily_analytics(
        self,
        total_orders: int,
        total_revenue: float,
        new_users: int,
        new_designs: int,
    ) -> bool:
        """Send daily analytics report"""
        message = f"""
<b>Daily Analytics Report</b>

Orders: {total_orders}
Revenue: ${total_revenue:.2f}
New Users: {new_users}
New Designs: {new_designs}
        """
        return await self.send_message(message.strip())

    async def notify_system_alert(self, alert_type: str, message: str) -> bool:
        """Send system alert"""
        alert_message = f"""
<b>System Alert: {alert_type}</b>

{message}
        """
        return await self.send_message(alert_message.strip())


# Create singleton instance
telegram_service = TelegramService()
