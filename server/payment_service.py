"""Stripe payment integration service with dynamic runtime configuration."""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Dict, Optional

import stripe

from server.config_service import config_service

logger = logging.getLogger(__name__)


class PaymentService:
    """Service for handling Stripe payments."""

    def __init__(self) -> None:
        self._secret_key = os.getenv("STRIPE_SECRET_KEY", "")
        self._enabled = False
        self._lock = asyncio.Lock()
        self._apply_secret(self._secret_key)
        config_service.add_listener(self._on_config_updated)

    async def _on_config_updated(self, settings: Dict[str, Any]) -> None:
        stripe_settings = settings.get("stripe", {}) if settings else {}
        secret = stripe_settings.get("secret_key") or os.getenv("STRIPE_SECRET_KEY", "")
        await self.set_secret(secret)

    def _apply_secret(self, secret_key: str) -> None:
        key = secret_key.strip()
        if not key:
            self._enabled = False
            logger.warning("Stripe secret key missing; payment processing disabled.")
            return

        stripe.api_key = key
        self._secret_key = key
        self._enabled = key.startswith("sk_")
        if self._enabled:
            logger.info("Stripe configured successfully (masked).")
        else:
            logger.warning("Stripe key does not appear to be valid; check configuration.")

    async def set_secret(self, secret_key: str) -> None:
        async with self._lock:
            if secret_key != self._secret_key:
                self._apply_secret(secret_key)

    def is_enabled(self) -> bool:
        return self._enabled

    async def create_payment_intent(
        self,
        amount: float,
        currency: str = "usd",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        if not self.is_enabled():
            logger.error("Stripe is not configured")
            return None

        try:
            amount_cents = int(amount * 100)
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={"enabled": True},
            )

            logger.info("Created payment intent %s", payment_intent.id)

            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id,
                "amount": amount,
                "currency": currency,
            }

        except stripe.error.StripeError as err:
            logger.error("Stripe error: %s", err)
            return None
        except Exception as err:  # pragma: no cover - defensive logging
            logger.error("Error creating payment intent: %s", err)
            return None

    async def confirm_payment(self, payment_intent_id: str, wait_seconds: float = 6.0) -> bool:
        if not self.is_enabled():
            logger.error("Stripe is not configured")
            return False

        try:
            deadline = asyncio.get_event_loop().time() + max(0.5, wait_seconds)
            while True:
                payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                status = getattr(payment_intent, "status", None)
                logger.info("Stripe payment_intent %s status: %s", payment_intent_id, status)

                if status == "succeeded":
                    return True
                if status in {"canceled", "requires_payment_method"}:
                    return False
                if status in {"processing", "requires_capture", "requires_action"}:
                    if asyncio.get_event_loop().time() < deadline:
                        await asyncio.sleep(0.5)
                        continue
                    logger.warning(
                        "Payment intent %s still %s after polling; treating as failure",
                        payment_intent_id,
                        status,
                    )
                    return False
                if asyncio.get_event_loop().time() < deadline:
                    await asyncio.sleep(0.5)
                    continue
                return False

        except stripe.error.StripeError as err:
            logger.error("Stripe error: %s", err)
            return False
        except Exception as err:  # pragma: no cover - defensive logging
            logger.error("Error confirming payment: %s", err)
            return False

    async def refund_payment(
        self,
        payment_intent_id: str,
        amount: Optional[float] = None,
        reason: Optional[str] = None,
    ) -> bool:
        if not self.is_enabled():
            logger.error("Stripe is not configured")
            return False

        try:
            refund_params: Dict[str, Any] = {"payment_intent": payment_intent_id}

            if amount is not None:
                refund_params["amount"] = int(amount * 100)

            if reason:
                refund_params["reason"] = reason

            refund = stripe.Refund.create(**refund_params)
            logger.info("Created refund %s", refund.id)
            return refund.status == "succeeded"

        except stripe.error.StripeError as err:
            logger.error("Stripe error: %s", err)
            return False
        except Exception as err:  # pragma: no cover
            logger.error("Error creating refund: %s", err)
            return False

    async def get_payment_status(self, payment_intent_id: str) -> Optional[str]:
        if not self.is_enabled():
            logger.error("Stripe is not configured")
            return None

        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return payment_intent.status

        except stripe.error.StripeError as err:
            logger.error("Stripe error: %s", err)
            return None
        except Exception as err:  # pragma: no cover
            logger.error("Error getting payment status: %s", err)
            return None


payment_service = PaymentService()
