"""
Stripe payment integration service
"""
import os
import logging
from typing import Optional, Dict, Any
import stripe

from db_models import Order, OrderStatus

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_ENABLED = bool(stripe.api_key and stripe.api_key.startswith("sk_"))

if not STRIPE_ENABLED:
    logger.warning("Stripe is not configured. Payment processing will be disabled.")

class PaymentService:
    """Service for handling Stripe payments"""
    
    @staticmethod
    def is_enabled() -> bool:
        """Check if Stripe is properly configured"""
        return STRIPE_ENABLED
    
    @staticmethod
    async def create_payment_intent(
        amount: float,
        currency: str = "usd",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a Stripe payment intent
        
        Args:
            amount: Amount in dollars (will be converted to cents)
            currency: Currency code (default: usd)
            metadata: Additional metadata to attach to the payment
        
        Returns:
            Payment intent data or None if failed
        """
        if not STRIPE_ENABLED:
            logger.error("Stripe is not configured")
            return None
        
        try:
            # Convert dollars to cents
            amount_cents = int(amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    "enabled": True,
                },
            )
            
            logger.info(f"Created payment intent: {payment_intent.id}")
            
            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id,
                "amount": amount,
                "currency": currency
            }
        
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            return None
    
    @staticmethod
    async def confirm_payment(payment_intent_id: str) -> bool:
        """
        Confirm a payment was successful
        
        Args:
            payment_intent_id: Stripe payment intent ID
        
        Returns:
            True if payment succeeded, False otherwise
        """
        if not STRIPE_ENABLED:
            logger.error("Stripe is not configured")
            return False
        
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return payment_intent.status == "succeeded"
        
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error confirming payment: {str(e)}")
            return False
    
    @staticmethod
    async def refund_payment(
        payment_intent_id: str,
        amount: Optional[float] = None,
        reason: Optional[str] = None
    ) -> bool:
        """
        Refund a payment
        
        Args:
            payment_intent_id: Stripe payment intent ID
            amount: Amount to refund in dollars (None for full refund)
            reason: Reason for refund
        
        Returns:
            True if refund succeeded, False otherwise
        """
        if not STRIPE_ENABLED:
            logger.error("Stripe is not configured")
            return False
        
        try:
            refund_params = {
                "payment_intent": payment_intent_id,
            }
            
            if amount is not None:
                refund_params["amount"] = int(amount * 100)
            
            if reason:
                refund_params["reason"] = reason
            
            refund = stripe.Refund.create(**refund_params)
            
            logger.info(f"Created refund: {refund.id}")
            return refund.status == "succeeded"
        
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error creating refund: {str(e)}")
            return False
    
    @staticmethod
    async def get_payment_status(payment_intent_id: str) -> Optional[str]:
        """
        Get the status of a payment
        
        Args:
            payment_intent_id: Stripe payment intent ID
        
        Returns:
            Payment status string or None if failed
        """
        if not STRIPE_ENABLED:
            logger.error("Stripe is not configured")
            return None
        
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return payment_intent.status
        
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error getting payment status: {str(e)}")
            return None

# Create a singleton instance
payment_service = PaymentService()
