---
title: Physical AI Book RAG Backend
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# Physical AI & Humanoid Robotics - RAG Chatbot Backend

This is the FastAPI AI backend for the **Physical AI & Humanoid Robotics** interactive textbook.
It utilizes **OpenRouter** with the **`baidu/ernie-5.5-flash-preview:free`** model and agentic retrieval.

## Features
- 🚀 **FastAPI REST API**: High-performance asynchronous API with CORS enabled.
- 🧠 **OpenRouter Integration**: Configured with `baidu/ernie-5.5-flash-preview:free` (Baidu ERNIE 5.5 Flash).
- 📖 **Agentic Textbook Retrieval**: Strictly answers questions from the 7 chapters of the Physical AI book.
- 🛡️ **Resilient Multi-Tier Search**: Automatic fallback between Qdrant vector database and bundled textbook documentation (`book_docs/`).
- 🤗 **Hugging Face Spaces Ready**: Docker-based container configured for port `7860`.

## API Endpoints
- `GET /`: Health status and service information.
- `GET /health` or `GET /status`: Healthcheck endpoint for monitoring.
- `POST /ask`: Send query JSON `{ "message": "What is physical AI?" }` and receive `{ "reply": "..." }`.

## Hugging Face Spaces Deployment Steps
1. Create a new Space on [Hugging Face](https://huggingface.co/new-space).
2. Choose **Docker** as the Space SDK (Blank).
3. Push or upload the contents of the `rag_backend` folder to your Hugging Face Space repository.
4. In your Space's **Settings -> Variables and secrets**, add:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key (`sk-or-v1-...`)
   - `OPENROUTER_BASE_URL`: `https://openrouter.ai/api/v1`
   - `MODEL_NAME`: `baidu/ernie-5.5-flash-preview:free`
5. Once built, your Space URL will be:
   `https://<your-username>-<space-name>.hf.space/ask`
