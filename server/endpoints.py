"""
API Endpoints and WebSocket Handlers
"""

import asyncio
import queue
import time
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from stt_service import STTStreamingService

# Create router
router = APIRouter()


@router.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Real-time STT Service",
        "version": "1.0.0",
    }


@router.get("/health")
async def health():
    """Health check for monitoring."""
    return {"status": "healthy"}


@router.websocket("/ws/stt")
async def websocket_stt_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time speech-to-text streaming.

    Client sends: Binary audio chunks (16kHz, mono, LINEAR16)
    Server sends: JSON with transcription results

    Message format from server:
    {
        "type": "transcript",
        "transcript": "recognized text",
        "is_final": true/false,
        "timestamp": 12345,  // milliseconds
        "confidence": 0.95   // only for final results
    }

    or error:
    {
        "type": "error",
        "message": "error description"
    }
    """
    await websocket.accept()
    print(f"\n{'*'*80}", flush=True)
    print("✅ WebSocket client connected - 실시간 음성 인식 시작", flush=True)
    print(f"{'*'*80}\n", flush=True)

    # Initialize STT service
    stt_service = STTStreamingService()
    audio_queue = queue.Queue()

    # Flag to control tasks
    receiving = True

    async def receive_audio():
        """Receive audio chunks from client and put in queue."""
        nonlocal receiving
        chunk_count = 0
        try:
            while receiving:
                # Receive binary audio data
                data = await websocket.receive_bytes()

                if data:
                    audio_queue.put(data)
                    chunk_count += 1
                    # Log every 20 chunks for better visibility
                    if chunk_count % 20 == 0:
                        print(
                            f"🎵 Received {chunk_count} audio chunks ({len(data)} bytes)",
                            flush=True,
                        )
                else:
                    # Empty data signals end
                    audio_queue.put(None)
                    break

        except WebSocketDisconnect:
            print("🔌 Client disconnected")
            receiving = False
            audio_queue.put(None)  # Signal end of stream
        except Exception as e:
            print(f"❌ Error receiving audio: {e}")
            receiving = False
            audio_queue.put(None)

    async def send_transcripts():
        """Process audio through STT and send results to client."""
        nonlocal stt_service
        restart_count = 0
        max_restarts = 100  # Allow up to 100 restarts (500 minutes total)
        
        while receiving and restart_count < max_restarts:
            try:
                print(f"\n🔄 Starting STT stream (session {restart_count + 1})")
                
                async for result in stt_service.stream_recognize(audio_queue):
                    if not receiving:
                        break

                    # Check if it's an error
                    if "error" in result:
                        error_msg = result.get("error", "")
                        # Check if it's the 5-minute limit error
                        if "5 minutes" in error_msg or "Max duration" in error_msg:
                            print(f"\n⚠️ Stream limit reached, will restart...")
                            break  # Break to restart
                        
                        await websocket.send_json(
                            {
                                "type": "error",
                                "message": error_msg,
                                "timestamp": result.get("timestamp", 0),
                            }
                        )
                        continue

                    # Send both interim and final results
                    is_final = result.get("is_final", False)
                    timestamp_str = time.strftime("%H:%M:%S")

                    message = {
                        "type": "transcript",
                        "transcript": result["transcript"],
                        "is_final": is_final,
                        "timestamp": result["timestamp"],
                    }

                    # Add confidence if available (usually only for final results)
                    if "confidence" in result:
                        message["confidence"] = result["confidence"]

                    # Send to client
                    await websocket.send_json(message)

                    # Logging
                    marker = "✅" if is_final else "💬"
                    status = "final" if is_final else "interim"
                    print(f"[{timestamp_str}] {marker} → 클라이언트 전송 ({status}): {result['transcript'][:50]}", flush=True)

                # Stream ended, check if we should restart
                if receiving:
                    restart_count += 1
                    print(f"\n🔄 Restarting STT stream (attempt {restart_count})...")
                    stt_service = STTStreamingService()  # Create new service instance
                    await asyncio.sleep(0.1)  # Brief pause before restart
                    
            except Exception as e:
                error_str = str(e)
                print(f"❌ Error in send_transcripts: {e}")
                
                # Check if it's a restart-able error
                if "5 minutes" in error_str or "Max duration" in error_str:
                    restart_count += 1
                    print(f"\n🔄 Restarting after timeout (attempt {restart_count})...")
                    stt_service = STTStreamingService()
                    await asyncio.sleep(0.1)
                    continue
                
                if receiving:
                    try:
                        await websocket.send_json(
                            {
                                "type": "error",
                                "message": str(e),
                            }
                        )
                    except Exception:
                        pass
                break  # Exit on non-restartable errors

    # Run both tasks concurrently
    try:
        await asyncio.gather(
            receive_audio(),
            send_transcripts(),
        )
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
    finally:
        receiving = False
        try:
            await websocket.close()
        except Exception:
            pass
        print("👋 WebSocket connection closed")
