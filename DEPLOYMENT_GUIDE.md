# 🚀 Complete Deployment & Setup Guide

This guide provides instructions to run the project locally and deploy both the **Frontend to Vercel** and the **AI Backend to Hugging Face Spaces**.

---

## 1. Quick Local Setup

### Step 1: Start the Auth Server (Port 3001)
```bash
cd backend/auth_server
npm install
npm run migrate    # Sets up Neon DB user & session tables
npm start          # Runs on http://localhost:3001
```

### Step 2: Start the AI RAG Backend (Port 7860)
```bash
cd rag_backend
pip install -r requirements.txt
python main.py     # Runs on http://localhost:7860
```
- Model: `baidu/ernie-5.5-flash-preview:free` via OpenRouter.
- Has high-availability local fallback to the textbook chapters in `book_docs/`.

### Step 3: Start the Frontend (Port 3000)
```bash
# In the root folder:
npm install
npm start          # Runs on http://localhost:3000
```
- Open [http://localhost:3000](http://localhost:3000).
- Go to `/register` to create an account.
- Go to `/login` to sign in.
- Click the chat bubble 💬 on any chapter to ask questions to the AI assistant!

---

## 2. Deploying Backend to Hugging Face Spaces

1. Go to [Hugging Face Spaces](https://huggingface.co/new-space).
2. Set:
   - **Space Name**: `physical-ai-book-backend` (or your choice)
   - **Space SDK**: **Docker** (Blank)
   - **Space Hardware**: Free CPU (basic is sufficient)
3. Upload or push the files from the `rag_backend` directory:
   - `Dockerfile`
   - `README.md`
   - `requirements.txt`
   - `main.py`
   - `agent.py`
   - `retrieving.py`
   - `book_docs/` (folder containing book markdown)
4. In your Space's **Settings -> Variables and secrets**:
   - `OPENROUTER_API_KEY`: `<your_openrouter_api_key>`
   - `OPENROUTER_BASE_URL`: `https://openrouter.ai/api/v1`
   - `MODEL_NAME`: `baidu/ernie-5.5-flash-preview:free`
   - `PORT`: `7860`
5. Once built, copy your public space direct URL:
   `https://<your-username>-physical-ai-book-backend.hf.space`

---

## 3. Deploying Frontend to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository.
3. Vercel will automatically detect `vercel.json`:
   - **Framework Preset**: Other / Docusaurus
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. In **Environment Variables**, add:
   - `RAG_BACKEND_URL`: `https://<your-username>-physical-ai-book-backend.hf.space` (Your deployed Hugging Face backend URL)
   - `AUTH_BACKEND_URL`: `https://<your-auth-server-url>` (Your deployed auth server, or Railway/Render/local)
5. Click **Deploy**!

---

## 4. Deploying Auth Server (Render / Railway / Hugging Face Docker)

The auth server can be deployed on any Node container host:
- Build command: `npm install`
- Start command: `npm start`
- Environment Variables:
  - `DATABASE_URL`: `postgresql://<user>:<password>@<host>/<dbname>?sslmode=require`
  - `BETTER_AUTH_SECRET`: `<your_generated_secret_key>`
  - `BETTER_AUTH_URL`: `https://<your-auth-domain>`
  - `FRONTEND_URL`: `https://<your-vercel-domain>.vercel.app`
