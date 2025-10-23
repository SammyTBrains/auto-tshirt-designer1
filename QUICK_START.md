# 🚀 Quick Start Guide - AI T-Shirt Designer

## Priority Feature: Custom Design Cart (✅ COMPLETED)

This application now supports generating AI-powered t-shirt designs and adding them to a shopping cart with position preservation!

## 📋 Prerequisites

1. **Node.js** 18+ and npm
2. **Python** 3.8+
3. **HuggingFace Account** (free)

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Your HuggingFace API Token

1. Create account at https://huggingface.co/
2. Go to https://huggingface.co/settings/tokens
3. Click "New token" → Name it → Select "read" role → Generate
4. Copy your token (starts with `hf_`)

### Step 2: Configure the Token

Open `/server/.env` and add your token:
```bash
HUGGINGFACE_TOKEN=hf_YourActualTokenHere123456789
```

### Step 3: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
pip install -r requirements.txt
cd ..
```

### Step 4: Start the Application

**Option A: Start Both Servers Manually**
```bash
# Terminal 1 - Start Backend
cd server
python main.py

# Terminal 2 - Start Frontend
npm run dev
```

**Option B: Windows Users**
```bash
start.bat
```

### Step 5: Use the Application! 🎉

1. Open http://localhost:3000
2. Click "Custom Studio" in navigation
3. Design your t-shirt:
   - Select color and size
   - Enter design prompt (e.g., "cosmic galaxy with stars")
   - Click "Generate Design"
   - Adjust position by dragging
   - Use sliders for scale and rotation
4. Click "Add to Cart"
5. View your custom design in the cart!

## 🎯 What You Can Do Now

### ✅ Working Features:
- Generate AI designs from text prompts
- Real-time design preview on t-shirt
- Drag and drop positioning
- Scale and rotation controls
- Color effects and background removal
- Add custom designs to cart
- View cart with design at exact position
- Adjust quantities
- Calculate totals

### 🔜 Coming Soon:
- Payment processing
- User accounts
- Order history
- Admin dashboard
- Store credit system

## 📚 Documentation

- **[HuggingFace API Setup](./HUGGINGFACE_API_SETUP.md)** - Detailed API configuration
- **[Cart Feature Guide](./CART_FEATURE_GUIDE.md)** - How the cart works
- **[Workflow Diagram](./WORKFLOW_DIAGRAM.md)** - Visual flow and architecture
- **[Main README](./README.md)** - Complete project documentation

## 🐛 Troubleshooting

### "API service is temporarily unavailable"
**Solution:** Make sure the backend server is running (`python server/main.py`)

### "Generate Design" button is disabled
**Solution:** Enter at least 10 characters in the design prompt field

### Design doesn't appear in cart
**Solution:** 
1. Make sure you clicked "Add to Cart" after generating
2. Check browser console for errors
3. Verify CartContext is working

### HuggingFace API errors
**Solutions:**
- Verify token is correct in `/server/.env`
- Check token has "read" permissions
- Wait if model is loading (first request takes ~30 seconds)
- Check rate limits (free tier has limits)

## 💡 Usage Tips

### Good Design Prompts:
- ✅ "A futuristic robot with neon lights"
- ✅ "Minimalist mountain landscape at sunset"
- ✅ "Abstract geometric patterns in blue and gold"
- ✅ "Kawaii cute panda eating bamboo"

### Avoid:
- ❌ Very short prompts ("car")
- ❌ Text in designs (AI struggles with text)
- ❌ Copyrighted characters/logos
- ❌ Inappropriate content

## 🎨 Design Tips

1. **Position**: Drag the design to center it on the t-shirt
2. **Scale**: Keep between 0.8x - 1.5x for best results
3. **Rotation**: Use for artistic effect, 0° is usually best
4. **Colors**: Works best on white or light-colored shirts
5. **Background**: Remove for transparent designs

## 📞 Support

### Common Questions:

**Q: Is the HuggingFace API free?**
A: Yes! Free tier includes rate-limited access. Upgrade for higher limits.

**Q: Can I use my own images?**
A: Currently AI-generation only. Upload feature coming soon!

**Q: How long does generation take?**
A: 5-30 seconds depending on model load and queue.

**Q: Can I save designs?**
A: Yes! Designs are saved to history automatically.

**Q: What payment methods are supported?**
A: Payment integration coming in next update!

## 🌟 Features Demo

### Generate a Design:
1. Go to Custom Studio
2. Type: "cyberpunk city with neon lights"
3. Click Generate
4. Wait 10-20 seconds
5. Design appears on shirt!

### Customize Position:
1. Click and drag the design
2. Use rotation slider
3. Use scale slider
4. See changes in real-time

### Add to Cart:
1. Click "Add to Cart"
2. Automatically navigates to cart
3. See your design on the t-shirt
4. Same position as studio!

## 🚀 You're All Set!

The priority feature is complete and ready to use. Follow the steps above and start creating amazing AI-generated t-shirt designs!

**Happy Designing! 🎨**
