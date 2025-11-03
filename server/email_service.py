"""Email notification service with runtime configurable settings."""
from __future__ import annotations

import logging
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

import aiosmtplib

from server.config_service import config_service

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending email notifications."""

    def __init__(self) -> None:
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", self.smtp_user)
        self.from_name = os.getenv("SMTP_FROM_NAME", "T-Shirt Designer")
        self._enabled = bool(self.smtp_user and self.smtp_password)

        if not self._enabled:
            logger.warning("Email is not configured. Email notifications will be disabled.")

        config_service.add_listener(self._on_config_updated)

    async def _on_config_updated(self, settings: dict[str, Any]) -> None:
        smtp_settings = settings.get("smtp", {}) if settings else {}
        if not smtp_settings:
            return

        def coalesce(current: str, new_value: Any) -> str:
            if new_value is None:
                return current
            if isinstance(new_value, str) and not new_value.strip():
                return current
            return str(new_value)

        # Apply overrides only when provided (non-empty) so env defaults survive.
        self.smtp_host = coalesce(self.smtp_host, smtp_settings.get("host"))
        port_value = smtp_settings.get("port")
        if port_value not in (None, ""):
            try:
                self.smtp_port = int(port_value)
            except (TypeError, ValueError):
                logger.warning("Invalid SMTP port in runtime config: %s", port_value)

        self.smtp_user = coalesce(self.smtp_user, smtp_settings.get("username"))
        self.smtp_password = coalesce(self.smtp_password, smtp_settings.get("password"))
        self.from_email = coalesce(self.from_email or self.smtp_user, smtp_settings.get("from_email"))
        self.from_name = coalesce(self.from_name, smtp_settings.get("from_name"))

        self._enabled = bool(self.smtp_user and self.smtp_password)
        if self._enabled:
            logger.info("Email settings active (host=%s).", self.smtp_host)
        else:
            logger.warning("Email settings incomplete; notifications disabled.")

    def is_enabled(self) -> bool:
        return self._enabled

    async def send_email(self, to_email: str, subject: str, body: str, html: bool = False) -> bool:
        if not self.is_enabled():
            logger.warning("Email not configured, skipping send")
            return False

        try:
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            message["Subject"] = subject

            if html:
                message.attach(MIMEText(body, "html"))
            else:
                message.attach(MIMEText(body, "plain"))

            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True,
            )

            logger.info("Email sent to %s", to_email)
            return True

        except Exception as exc:  # pragma: no cover - network errors
            logger.error("Error sending email: %s", exc)
            return False

    async def send_welcome_email(self, to_email: str, username: str) -> bool:
        subject = "Welcome to AI T-Shirt Designer!"
        body = f"""
        <html>
            <body>
                <h2>Welcome {username}!</h2>
                <p>Thank you for joining AI T-Shirt Designer.</p>
                <p>Start creating amazing custom t-shirt designs with AI today!</p>
                <p>Visit our platform to get started: <a href=\"http://localhost:3000\">Start Designing</a></p>
                <br>
                <p>Best regards,<br>The T-Shirt Designer Team</p>
            </body>
        </html>
        """
        return await self.send_email(to_email, subject, body, html=True)

    async def send_order_confirmation(self, to_email: str, order_number: str, total_amount: float) -> bool:
        subject = f"Order Confirmation - {order_number}"
        body = f"""
        <html>
            <body>
                <h2>Order Confirmation</h2>
                <p>Thank you for your order!</p>
                <p><strong>Order Number:</strong> {order_number}</p>
                <p><strong>Total Amount:</strong> ${total_amount:.2f}</p>
                <p>We'll send you another email when your order ships.</p>
                <br>
                <p>Best regards,<br>The T-Shirt Designer Team</p>
            </body>
        </html>
        """
        return await self.send_email(to_email, subject, body, html=True)

    async def send_design_purchase_notification(
        self,
        to_email: str,
        design_prompt: str,
        credits_earned: int,
    ) -> bool:
        subject = "Your design was purchased! Credits earned!"
        body = f"""
        <html>
            <body>
                <h2>Congratulations!</h2>
                <p>Someone just purchased your design: \"{design_prompt}\"</p>
                <p>You've earned <strong>{credits_earned} store credits</strong>!</p>
                <p>Keep creating amazing designs!</p>
                <br>
                <p>Best regards,<br>The T-Shirt Designer Team</p>
            </body>
        </html>
        """
        return await self.send_email(to_email, subject, body, html=True)


email_service = EmailService()
