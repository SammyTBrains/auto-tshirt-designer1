# Quick Setup Guide

Follow these steps to get the Auto T-Shirt Designer app running locally.

---

## 1. API (Backend) Setup

1. Install Python 3.11+ if not already available.
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the environment:
   - **Windows:**
     ```bash
     .venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     source .venv/bin/activate
     ```
4. Install backend dependencies:
   ```bash
   pip install -r server/requirements.txt
   ```
5. Configure environment variables:
   - In `server/.env` fill in values for `HOST`, `PORT`, `MONGODB_URL`, `MONGODB_DB_NAME`, `HF_API_KEY`, and any other required keys.

---

## 2. App (Frontend) Setup

1. Install Node.js 18+ (LTS recommended).
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Configure frontend environment (optional):
   - In root `.env` set `VITE_API_URL` if the API is not running on `http://localhost:8000`.

---

## 3. Start the Application

1. **Start the API** (from the project root):
   ```bash
   cd server
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - The API will be available at `http://localhost:8000`.
2. **Start the frontend** (new terminal at project root):
   ```bash
   npm run dev
   ```
   - By default Vite serves on `http://localhost:5173`.
3. Open the app in the browser: `http://localhost:5173` (update if you changed the port).

---

## Optional Checks

- **TypeScript type safety:** `npm run typecheck`
- **API smoke tests:** `python test_endpoints.py http://localhost:8000`

You're all set! Let me know if you need any assistance.
