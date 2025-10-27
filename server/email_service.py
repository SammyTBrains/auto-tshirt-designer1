"""
Email notification service
"""
import os
import logging
from typing import Optional, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

logger = logging.getLogger(__name__)

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
FROM_NAME = os.getenv("FROM_NAME", "T-Shirt Designer")

EMAIL_ENABLED = bool(SMTP_USER and SMTP_PASSWORD)

if not EMAIL_ENABLED:
    logger.warning("Email is not configured. Email notifications will be disabled.")

class EmailService:
    """Service for sending email notifications"""
    
    @staticmethod
    def is_enabled() -> bool:
        """Check if email is properly configured"""
        return EMAIL_ENABLED
    
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        body: str,
        html: bool = False
    ) -> bool:
        """
        Send an email
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body
            html: Whether body is HTML
        
        Returns:
            True if sent successfully, False otherwise
        """
        if not EMAIL_ENABLED:
            logger.warning("Email not configured, skipping send")
            return False
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add body
            if html:
                message.attach(MIMEText(body, "html"))
            else:
                message.attach(MIMEText(body, "plain"))
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USER,
                password=SMTP_PASSWORD,
                start_tls=True
            )
            
            logger.info(f"Email sent to {to_email}")
            return True
        
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False
    
    @staticmethod
    async def send_welcome_email(to_email: str, username: str) -> bool:
        """Send welcome email to new user"""
        subject = "Welcome to AI T-Shirt Designer!"
        body = f"""
        <html>
            <body>
                <h2>Welcome {username}!</h2>
                <p>Thank you for joining AI T-Shirt Designer.</p>
                <p>Start creating amazing custom t-shirt designs with AI today!</p>
                <p>Visit our platform to get started: <a href="http://localhost:3000">Start Designing</a></p>
                <br>
                <p>Best regards,<br>The T-Shirt Designer Team</p>
            </body>
        </html>
        """
        return await EmailService.send_email(to_email, subject, body, html=True)
    
    @staticmethod
    async def send_order_confirmation(
        to_email: str,
        order_number: str,
        total_amount: float
    ) -> bool:
        """Send order confirmation email"""
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
        return await EmailService.send_email(to_email, subject, body, html=True)
    
    @staticmethod
    async def send_design_purchase_notification(
        to_email: str,
        design_prompt: str,
        credits_earned: int
    ) -> bool:
        """Send notification when someone purchases user's design"""
        subject = "Your design was purchased! Credits earned!"
        body = f"""
        <html>
            <body>
                <h2>Congratulations!</h2>
                <p>Someone just purchased your design: "{design_prompt}"</p>
                <p>You've earned <strong>{credits_earned} store credits</strong>!</p>
                <p>Keep creating amazing designs!</p>
                <br>
                <p>Best regards,<br>The T-Shirt Designer Team</p>
            </body>
        </html>
        """
        return await EmailService.send_email(to_email, subject, body, html=True)

# Create singleton instance
email_service = EmailService()
