"""
Configuration for STT Backend Service
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Server settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
