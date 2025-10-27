# Complete Setup Guide - AI T-Shirt Designer

This guide provides comprehensive instructions for setting up and running the AI T-Shirt Designer application with all features enabled.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start (Minimal Setup)](#quick-start-minimal-setup)
3. [Full Setup (All Features)](#full-setup-all-features)
4. [Environment Variables](#environment-variables)
5. [Testing the Application](#testing-the-application)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Git** for version control

### Required Services
- **HuggingFace Account** (Free) - For AI design generation
- **MongoDB** (Required for user management and orders)

### Optional Services (for full functionality)
- **Stripe Account** - For payment processing
- **Email Service** (Gmail/SMTP) - For notifications
- **Telegram Bot** - For admin notifications

## Quick Start (Minimal Setup)

This setup includes AI design generation and basic cart functionality (no user accounts or payments).

### Step 1: Clone Repository
```bash
git clone https://github.com/SammyTBrains/auto-tshirt-designer1.git
cd auto-tshirt-designer1
```

### Step 2: Get HuggingFace API Token

1. Go to https://huggingface.co/
2. Create a free account (no credit card needed)
3. Navigate to https://huggingface.co/settings/tokens
4. Click "New token"
5. Name it "T-Shirt Designer"
6. Select role: "read"
7. Click "Generate token"
8. Copy the token (starts with `hf_`)

### Step 3: Configure Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your HuggingFace token:
```env
HUGGINGFACE_TOKEN=hf_YourActualTokenHere
```

### Step 4: Install Dependencies

**Backend:**
```bash
cd server
pip install -r requirements.txt
cd ..
```

**Frontend:**
```bash
npm install
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 6: Access the Application

Open your browser to: http://localhost:3000

**What Works:**
- ✅ AI design generation
- ✅ Real-time preview
- ✅ Design customization
- ✅ Shopping cart
- ❌ User accounts (requires MongoDB)
- ❌ Payments (requires Stripe)
- ❌ Email notifications
- ❌ Admin dashboard

## Full Setup (All Features)

This setup enables all features including user management, payments, and notifications.

### 1. MongoDB Setup

#### Option A: Local MongoDB

**Install MongoDB:**
- **Windows:** Download from https://www.mongodb.com/try/download/community
- **macOS:** `brew install mongodb-community`
- **Linux:** `sudo apt-get install mongodb`

**Start MongoDB:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Connection URL:**
```
mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

**Connection URL Example:**
```
mongodb+srv://username:password@cluster.mongodb.net/tshirt_designer
```

### 2. Stripe Setup (Optional - for Payments)

1. Go to https://stripe.com/
2. Create an account
3. Navigate to Developers → API keys
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)

### 3. Email Setup (Optional - for Notifications)

#### Using Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password

**Email Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-digit-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=T-Shirt Designer
```

### 4. Telegram Bot Setup (Optional - for Admin Notifications)

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the bot token
5. Get your chat ID:
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find "chat":{"id": number in the response

**Telegram Configuration:**
```env
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 5. Complete Environment Configuration

Edit `server/.env` with all your credentials:

```env
# Required
HUGGINGFACE_TOKEN=hf_YourTokenHere
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=tshirt_designer

# Security (CHANGE THIS!)
JWT_SECRET_KEY=your-super-secret-key-at-least-32-characters-long

# Optional - Stripe
STRIPE_SECRET_KEY=sk_test_YourStripeSecretKey
STRIPE_PUBLISHABLE_KEY=pk_test_YourStripePublishableKey

# Optional - Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=T-Shirt Designer

# Optional - Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

### 6. Install All Dependencies

```bash
# Backend
cd server
pip install -r requirements.txt

# Frontend
cd ..
npm install
```

### 7. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HUGGINGFACE_TOKEN` | HuggingFace API token for AI generation | `hf_abc123...` |
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `JWT_SECRET_KEY` | Secret key for JWT tokens (min 32 chars) | `your-super-secret-key...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | None |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | None |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | None |
| `SMTP_PASSWORD` | SMTP password | None |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | None |
| `TELEGRAM_CHAT_ID` | Telegram chat ID for notifications | None |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiry time | `10080` (7 days) |

## Testing the Application

### 1. Test AI Design Generation

1. Navigate to "Custom Studio"
2. Enter a prompt: "A cosmic galaxy with swirling nebulas"
3. Click "Generate Design"
4. Wait 10-30 seconds for generation

### 2. Test User Registration (requires MongoDB)

1. Click "Sign up" in navigation
2. Enter email, username, and password
3. Submit registration
4. You should be automatically logged in

### 3. Test Store Credits (requires MongoDB)

1. Create a design and save it
2. Have another user purchase the design
3. Check your profile - you should have 10 credits

### 4. Test Admin Dashboard (requires MongoDB)

1. Login as admin user
2. Navigate to `/admin`
3. View analytics and system stats

### 5. Test Telegram Notifications (optional)

1. Go to Admin Dashboard
2. Click "Test Telegram Notification"
3. Check your Telegram chat for the message

## Troubleshooting

### Issue: "Database not available" error
**Solution:**
- Ensure MongoDB is running
- Check MONGODB_URL in .env is correct
- Test connection: `mongosh "your-connection-string"`

### Issue: "Stripe is not configured" when checking out
**Solution:**
- Payments require Stripe configuration
- Add STRIPE_SECRET_KEY to server/.env
- Payments are optional - app works without it

### Issue: Email notifications not sending
**Solution:**
- Email is optional
- Check SMTP credentials in .env
- For Gmail, use App Password, not regular password
- Test with: `python -c "import aiosmtplib; print('imported')"`

### Issue: "401 Unauthorized" when accessing profile
**Solution:**
- Ensure you're logged in
- Token may have expired - log in again
- Check JWT_SECRET_KEY hasn't changed

### Issue: Telegram notifications not working
**Solution:**
- Telegram is optional
- Verify bot token is correct
- Ensure you've sent at least one message to the bot
- Test bot: `https://api.telegram.org/bot<TOKEN>/getMe`

### Issue: Frontend can't connect to backend
**Solution:**
- Ensure backend is running on port 8000
- Check console for CORS errors
- Verify API_URL in frontend is correct

### Issue: "HuggingFace API error"
**Solution:**
- Verify token in server/.env is correct
- First API call may take 30+ seconds as model loads
- Free tier has rate limits - wait if exceeded
- Check token permissions at https://huggingface.co/settings/tokens

## Feature Availability Matrix

| Feature | Requires MongoDB | Requires Stripe | Requires Email | Requires Telegram |
|---------|-----------------|-----------------|----------------|-------------------|
| AI Design Generation | ❌ | ❌ | ❌ | ❌ |
| Design Preview | ❌ | ❌ | ❌ | ❌ |
| Shopping Cart | ❌ | ❌ | ❌ | ❌ |
| User Accounts | ✅ | ❌ | ❌ | ❌ |
| Save Designs | ✅ | ❌ | ❌ | ❌ |
| Order Management | ✅ | ❌ | ❌ | ❌ |
| Payment Processing | ✅ | ✅ | ❌ | ❌ |
| Store Credits | ✅ | ❌ | ❌ | ❌ |
| Email Notifications | ❌ | ❌ | ✅ | ❌ |
| Admin Dashboard | ✅ | ❌ | ❌ | ❌ |
| Telegram Alerts | ❌ | ❌ | ❌ | ✅ |

## Next Steps

After setup:

1. Create your first admin user by registering, then manually updating the user role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "your-admin@email.com" },
     { $set: { role: "admin" } }
   )
   ```

2. Test all features systematically

3. Configure any optional services you want to use

4. For production deployment, see DEPLOYMENT.md

## Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs in `logs/server.log`
- Check browser console (F12) for frontend errors
- Create an issue on GitHub

## Security Notes

**IMPORTANT:** Before deploying to production:

1. Change `JWT_SECRET_KEY` to a strong, unique value
2. Never commit `.env` file to version control
3. Use environment-specific configurations
4. Enable HTTPS in production
5. Keep all dependencies up to date
6. Review and set appropriate CORS origins

---

**Setup completed!** You can now start creating amazing AI-generated t-shirt designs! 🎨
