"""
Test script to verify all service configurations
"""
import os
import sys
import asyncio
from pathlib import Path

# Set UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

print("=" * 60)
print("SERVICE CONFIGURATION TEST")
print("=" * 60)

# Test 1: Environment Variables
print("\n1. ENVIRONMENT VARIABLES:")
print("-" * 60)
env_vars = {
    "MONGODB_URL": os.getenv("MONGODB_URL", ""),
    "MONGODB_DB_NAME": os.getenv("MONGODB_DB_NAME", ""),
    "STRIPE_SECRET_KEY": os.getenv("STRIPE_SECRET_KEY", "")[:20] + "..." if os.getenv("STRIPE_SECRET_KEY") else "",
    "SMTP_USER": os.getenv("SMTP_USER", ""),
    "SMTP_PASSWORD": "***" if os.getenv("SMTP_PASSWORD") else "",
    "SMTP_HOST": os.getenv("SMTP_HOST", ""),
    "SMTP_PORT": os.getenv("SMTP_PORT", ""),
    "TELEGRAM_BOT_TOKEN": os.getenv("TELEGRAM_BOT_TOKEN", "")[:20] + "..." if os.getenv("TELEGRAM_BOT_TOKEN") else "",
    "TELEGRAM_CHAT_ID": os.getenv("TELEGRAM_CHAT_ID", ""),
}

for key, value in env_vars.items():
    status = "✓" if value else "✗"
    print(f"{status} {key}: {value if value else 'NOT SET'}")

# Test 2: MongoDB
print("\n2. MONGODB CONNECTION:")
print("-" * 60)
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo.errors import ServerSelectionTimeoutError
    
    mongodb_url = os.getenv("MONGODB_URL")
    if mongodb_url:
        client = AsyncIOMotorClient(
            mongodb_url,
            serverSelectionTimeoutMS=5000,
            socketTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        
        async def test_mongo():
            try:
                await client.admin.command('ping')
                print("✓ MongoDB: Connected successfully!")
                
                # Test database access
                db_name = os.getenv("MONGODB_DB_NAME", "tshirt_designer")
                db = client[db_name]
                collections = await db.list_collection_names()
                print(f"✓ Database '{db_name}' accessible")
                print(f"  Collections: {collections if collections else 'None (new database)'}")
                return True
            except ServerSelectionTimeoutError as e:
                print(f"✗ MongoDB: Connection timeout - {str(e)}")
                return False
            except Exception as e:
                print(f"✗ MongoDB: Error - {str(e)}")
                return False
            finally:
                client.close()
        
        mongo_ok = asyncio.run(test_mongo())
    else:
        print("✗ MongoDB: MONGODB_URL not configured")
        mongo_ok = False
except Exception as e:
    print(f"✗ MongoDB: Import/Setup Error - {str(e)}")
    mongo_ok = False

# Test 3: Stripe
print("\n3. STRIPE CONFIGURATION:")
print("-" * 60)
try:
    import stripe
    
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    if stripe_key and stripe_key.startswith("sk_"):
        stripe.api_key = stripe_key
        try:
            # Test API key by listing payment methods
            account = stripe.Account.retrieve()
            print(f"✓ Stripe: Connected successfully!")
            print(f"  Account ID: {account.id}")
            print(f"  Country: {account.country}")
            print(f"  Mode: {'Test' if stripe_key.startswith('sk_test') else 'Live'}")
            stripe_ok = True
        except stripe.error.AuthenticationError:
            print("✗ Stripe: Invalid API key")
            stripe_ok = False
        except Exception as e:
            print(f"✗ Stripe: Error - {str(e)}")
            stripe_ok = False
    else:
        print("✗ Stripe: STRIPE_SECRET_KEY not configured or invalid format")
        stripe_ok = False
except Exception as e:
    print(f"✗ Stripe: Import/Setup Error - {str(e)}")
    stripe_ok = False

# Test 4: Email (SMTP)
print("\n4. EMAIL (SMTP) CONFIGURATION:")
print("-" * 60)
try:
    import aiosmtplib
    from email.mime.text import MIMEText
    
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    
    if smtp_user and smtp_password:
        async def test_smtp():
            try:
                # Test using the same method as the actual service
                from email.mime.text import MIMEText
                from email.mime.multipart import MIMEMultipart
                
                # Create a test message (we won't actually send it)
                message = MIMEMultipart()
                message["From"] = smtp_user
                message["To"] = smtp_user  # Send to self for testing
                message["Subject"] = "Test Connection"
                message.attach(MIMEText("Test", "plain"))
                
                # Try to send (this tests connection and auth)
                await aiosmtplib.send(
                    message,
                    hostname=smtp_host,
                    port=smtp_port,
                    username=smtp_user,
                    password=smtp_password,
                    start_tls=True,
                    timeout=10
                )
                print(f"✓ Email: SMTP connection successful!")
                print(f"  Host: {smtp_host}:{smtp_port}")
                print(f"  User: {smtp_user}")
                print(f"  Test email sent to {smtp_user}")
                return True
            except aiosmtplib.SMTPAuthenticationError:
                print(f"✗ Email: Authentication failed - check password")
                print(f"  Note: For Gmail, use App Password, not regular password")
                return False
            except Exception as e:
                print(f"✗ Email: Connection error - {str(e)}")
                return False
        
        email_ok = asyncio.run(test_smtp())
    else:
        print("✗ Email: SMTP_USER or SMTP_PASSWORD not configured")
        email_ok = False
except Exception as e:
    print(f"✗ Email: Import/Setup Error - {str(e)}")
    email_ok = False

# Test 5: Telegram
print("\n5. TELEGRAM BOT CONFIGURATION:")
print("-" * 60)
try:
    from telegram import Bot
    from telegram.error import InvalidToken, TelegramError
    
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
    
    if bot_token and chat_id:
        async def test_telegram():
            try:
                bot = Bot(token=bot_token)
                # Get bot info
                me = await bot.get_me()
                print(f"✓ Telegram: Bot connected successfully!")
                print(f"  Bot Name: @{me.username}")
                print(f"  Bot ID: {me.id}")
                
                # Test sending message
                try:
                    await bot.send_message(
                        chat_id=chat_id,
                        text="🧪 Test message from T-Shirt Designer setup verification"
                    )
                    print(f"✓ Telegram: Test message sent to chat {chat_id}")
                    return True
                except TelegramError as e:
                    print(f"✗ Telegram: Could not send message - {str(e)}")
                    print(f"  Make sure chat_id {chat_id} is correct")
                    return False
            except InvalidToken:
                print(f"✗ Telegram: Invalid bot token")
                return False
            except Exception as e:
                print(f"✗ Telegram: Error - {str(e)}")
                return False
        
        telegram_ok = asyncio.run(test_telegram())
    else:
        print("✗ Telegram: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured")
        telegram_ok = False
except Exception as e:
    print(f"✗ Telegram: Import/Setup Error - {str(e)}")
    telegram_ok = False

# Summary
print("\n" + "=" * 60)
print("SUMMARY:")
print("=" * 60)
services = {
    "MongoDB": mongo_ok,
    "Stripe": stripe_ok,
    "Email (SMTP)": email_ok,
    "Telegram": telegram_ok
}

for service, status in services.items():
    status_text = "✓ WORKING" if status else "✗ FAILED"
    print(f"{status_text:>15} - {service}")

total_working = sum(services.values())
print(f"\nServices Working: {total_working}/{len(services)}")
print("=" * 60)

if total_working == len(services):
    print("\n🎉 All services configured correctly!")
else:
    print("\n⚠️  Some services need attention. Check details above.")
