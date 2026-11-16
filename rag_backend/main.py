import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from agents import Runner
from agent import agent, MODEL_NAME

load_dotenv()

app = FastAPI(
    title="Physical AI & Humanoid Robotics - RAG Chatbot API",
    description="FastAPI AI Assistant powered by OpenRouter and textbook retrieval",
    version="1.0.0"
)

# Enable CORS for frontend deployment (Vercel, localhost, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def home():
    return {
        "service": "Physical AI & Humanoid Robotics Chatbot Backend",
        "status": "online",
        "model": MODEL_NAME,
        "endpoints": {
            "health": "/health",
            "status": "/status",
            "ask": "POST /ask with JSON { \"message\": \"...\" }"
        }
    }

@app.get("/status")
@app.get("/health")
def status():
    return {"status": "ok", "model": MODEL_NAME}

@app.post("/ask")
async def chat_endpoint(request: ChatRequest):
    user_query = request.message.strip() if request.message else ""
    if not user_query:
        return {"reply": "Please provide a question about Physical AI or Humanoid Robotics."}

    print(f"\n📩 User query: {user_query}")
    try:
        result = await Runner.run(agent, input=user_query)
        reply_content = result.final_output
        print("✅ Reply successfully generated.")
        return {"reply": reply_content}
    except Exception as e:
        print(f"❌ [Chat Error]: {e}")
        # Provide helpful fallback instead of breaking client
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating response: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    # Hugging Face Spaces uses port 7860 by default
    port = int(os.environ.get("PORT", 7860 if os.environ.get("SPACE_ID") else 8000))
    print(f"🚀 Starting RAG Backend server on http://0.0.0.0:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
