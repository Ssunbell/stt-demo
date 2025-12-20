"""
FastAPI Server with WebSocket for Real-time STT
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import HOST, PORT, CORS_ORIGINS
from endpoints import router

# Initialize FastAPI app
app = FastAPI(
    title="Real-time STT Service",
    description="WebSocket-based Speech-to-Text service using Google Cloud",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    print(
        f"""
    🚀 Starting Real-time STT Service
    📍 Server: http://{HOST}:{PORT}
    🔌 WebSocket (STT V2 - Chirp): ws://{HOST}:{PORT}/ws/stt
    🌍 CORS Origins: {CORS_ORIGINS}
    """
    )

    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info",
    )
