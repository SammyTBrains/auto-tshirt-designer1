"""
Telegram bot service for admin notifications
"""
import os
import logging
from typing import Optional
import asyncio

logger = logging.getLogger(__name__)

# Telegram configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
TELEGRAM_ENABLED = bool(TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)

if not TELEGRAM_ENABLED:
    logger.warning("Telegram bot is not configured. Notifications will be disabled.")

# Lazy import telegram library
telegram_bot = None
if TELEGRAM_ENABLED:
    try:
        from telegram import Bot
        telegram_bot = Bot(token=TELEGRAM_BOT_TOKEN)
    except ImportError:
        logger.error("python-telegram-bot not installed. Install with: pip install python-telegram-bot")
        TELEGRAM_ENABLED = False
    except Exception as e:
        logger.error(f"Error initializing Telegram bot: {str(e)}")
        TELEGRAM_ENABLED = False

class TelegramService:
    """Service for sending Telegram notifications"""
    
    @staticmethod
    def is_enabled() -> bool:
        """Check if Telegram is properly configured"""
        return TELEGRAM_ENABLED and telegram_bot is not None
    
    @staticmethod
    async def send_message(message: str) -> bool:
        """
        Send a message to the admin Telegram chat
        
        Args:
            message: Message text
        
        Returns:
            True if sent successfully, False otherwise
        """
        if not TelegramService.is_enabled():
            logger.warning("Telegram not configured, skipping message")
            return False
        
        try:
            await telegram_bot.send_message(
                chat_id=TELEGRAM_CHAT_ID,
                text=message,
                parse_mode="HTML"
            )
            logger.info("Telegram message sent")
            return True
        
        except Exception as e:
            logger.error(f"Error sending Telegram message: {str(e)}")
            return False
    
    @staticmethod
    async def notify_new_order(order_number: str, total_amount: float, items_count: int) -> bool:
        """Send notification about new order"""
        message = f"""
🛍️ <b>New Order Received!</b>

Order: <code>{order_number}</code>
Amount: ${total_amount:.2f}
Items: {items_count}
        """
        return await TelegramService.send_message(message.strip())
    
    @staticmethod
    async def notify_payment_received(order_number: str, amount: float) -> bool:
        """Send notification about payment"""
        message = f"""
💰 <b>Payment Received!</b>

Order: <code>{order_number}</code>
Amount: ${amount:.2f}
            @staticmethod
            async def notify_payment_intent(order_number: str, amount: float, items_count: int) -> bool:
                """Send notification when payment intent is created (user is about to pay)"""
                message = f"""
        💳 <b>Payment Intent Created!</b>

        Order: <code>{order_number}</code>
        Amount: ${amount:.2f}
        Items: {items_count}

        <i>Customer is about to complete payment...</i>
                """
                return await TelegramService.send_message(message.strip())
    
        """
        return await TelegramService.send_message(message.strip())
    
    @staticmethod
    async def notify_trending_design(design_prompt: str, purchases: int) -> bool:
        """Send notification about trending design"""
        message = f"""
🔥 <b>Trending Design!</b>

Design: "{design_prompt}"
Purchases: {purchases}
        """
        return await TelegramService.send_message(message.strip())
    
    @staticmethod
    async def send_daily_analytics(
        total_orders: int,
        total_revenue: float,
        new_users: int,
        new_designs: int
    ) -> bool:
        """Send daily analytics report"""
        message = f"""
📊 <b>Daily Analytics Report</b>

Orders: {total_orders}
Revenue: ${total_revenue:.2f}
New Users: {new_users}
New Designs: {new_designs}
        """
        return await TelegramService.send_message(message.strip())
    
    @staticmethod
    async def notify_system_alert(alert_type: str, message: str) -> bool:
        """Send system alert"""
        alert_message = f"""
⚠️ <b>System Alert: {alert_type}</b>

{message}
        """
        return await TelegramService.send_message(alert_message.strip())

# Create singleton instance
telegram_service = TelegramService()
