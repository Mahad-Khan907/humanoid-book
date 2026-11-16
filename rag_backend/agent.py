import os
from openai import AsyncOpenAI
from agents import Agent, OpenAIChatCompletionsModel, set_tracing_disabled, function_tool
from dotenv import load_dotenv
from retrieving import retrieve_textbook_info

# --- CONFIGURATION ---
load_dotenv()
set_tracing_disabled(disabled=True)

# 1. LOAD CONFIGURATION
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "baidu/ernie-5.5-flash-preview:free")

if not OPENROUTER_API_KEY:
    print("⚠️ WARNING: OPENROUTER_API_KEY is not set. Set it in .env or environment variables.")

# 2. INITIALIZE ASYNC CLIENT
openai_client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY or "dummy_key",
    base_url=OPENROUTER_BASE_URL
)

# 3. SETUP MODEL
model = OpenAIChatCompletionsModel(
    model=MODEL_NAME,
    openai_client=openai_client
)

# 4. DEFINE THE STRICT SPECIALIZED TEXTBOOK AGENT
agent = Agent(
    name="PhysicalAITextbookBot",
    instructions="""
    You are the specialized AI Assistant for the 'Physical AI & Humanoid Robotics' textbook.
    
    YOUR RULES:
    1. **Primary Source:** Always consult the `retrieve_textbook_info` tool to ground your answers in the textbook content.
    2. **Tone & Style:** Provide clear, informative, helpful explanations using Markdown formatting (headings, bullet points, code blocks where applicable).
    3. **Refusal Policy:** If the user asks about completely unrelated topics (celebrity gossip, general pop culture, unrelated politics), politely decline: "I am specifically designed to answer questions about the Physical AI & Humanoid Robotics textbook."
    4. **Textbook Scope:** Always explain concepts such as ROS 2, NVIDIA Isaac, Isaac Sim, URDF, Gazebo, Vision-Language-Action (VLA) models, sensors, embodied intelligence, and humanoid robot hardware based on the textbook.
    """,
    model=model,
    tools=[function_tool(retrieve_textbook_info)]
)
