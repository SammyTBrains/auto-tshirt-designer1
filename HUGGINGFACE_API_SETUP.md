# HuggingFace API Setup Guide

This application uses the HuggingFace Inference API for AI-powered t-shirt design generation.

## Getting Your HuggingFace API Token

1. **Create a HuggingFace Account**

   - Go to https://huggingface.co/
   - Click "Sign Up" and create a free account
   - Verify your email address

2. **Generate an API Token**

   - Once logged in, go to your profile settings: https://huggingface.co/settings/tokens
   - Click "New token"
   - Choose **Fine-grained token** and enable the **Make calls to Inference Providers** permission (read access alone is no longer sufficient)
   - Give your token a name (e.g., "T-Shirt Designer")
   - Click "Generate token"
   - Copy the token (it starts with `hf_`)

3. **Configure the API Token**

   **For Server (Backend):**

   - Open `/server/.env` file
   - Update the line: `HUGGINGFACE_TOKEN=your_token_here`
   - Replace `your_token_here` with your actual token

   Example:

   ```
   HUGGINGFACE_TOKEN=hf_YourActualTokenHere123456789
   # Optional overrides:
   # HUGGINGFACE_MODEL=stabilityai/stable-diffusion-3.5-large
   # HUGGINGFACE_PROVIDER=hf-inference
   ```

   **For Worker (Optional - for local Stable Diffusion):**

   - Open `/worker/.env` file
   - Update the same line with your token

4. **Free Tier Information**
   - HuggingFace provides free API access for testing
   - The free tier includes:
     - Rate limits apply (typically a few requests per minute)
     - No credit card required for basic usage
   - For production use, consider HuggingFace Pro or Enterprise plans

## API Model Information

The application uses:

- **Primary Model**: `stabilityai/stable-diffusion-3.5-large`
- **API Endpoint (New Router)**: `https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3.5-large`
  - You can override this by setting `HUGGINGFACE_API_BASE` or `HUGGINGFACE_MODEL` in `/server/.env`.

## Troubleshooting

### "Model Loading" Error

If you get a "Model is currently loading" error, wait a few minutes and try again. The model auto-loads when first requested.

### "Rate Limit" Error

If you exceed the free tier rate limits, you'll need to:

- Wait a few minutes before trying again
- Upgrade to HuggingFace Pro for higher limits

### "Unauthorized" Error

Double-check that:

- Your token is correctly copied (no extra spaces)
- The token starts with `hf_`
- The token has the correct permissions (at least "read" access)

## Starting the Server

After configuring your token:

1. **Start the Backend Server:**

   ```bash
   cd server
   python main.py
   ```

2. **Start the Frontend:**

   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:3000` and start designing!

## Security Note

⚠️ **Never commit your API token to version control!**

- The `.env` files should be in `.gitignore`
- Only share tokens through secure channels
- Regenerate tokens if they are accidentally exposed
