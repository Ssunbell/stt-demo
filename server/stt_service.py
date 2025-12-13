"""
STT Streaming Service
Based on streaming_test.py
"""

import os
import time
import queue
import asyncio
import concurrent.futures
import datetime
from typing import AsyncGenerator, Optional
from google.cloud.speech_v2 import SpeechClient
from google.cloud.speech_v2.types import cloud_speech as cloud_speech_types
from google.api_core.client_options import ClientOptions
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Project settings
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "telos-7b2f6")
LOCATION = os.getenv("STT_LOCATION", "asia-northeast1")
MODEL = os.getenv("STT_MODEL", "chirp_3")

# Audio settings
SAMPLE_RATE = 16000
CHUNK_SIZE = int(SAMPLE_RATE / 10)  # 100ms chunks
STREAMING_LIMIT = 240000  # 4 minutes in milliseconds

# Language settings
LANGUAGE_CODES = ["ko-KR"]  # Default to Korean

# Google Cloud credentials
CREDENTIALS_PATH = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS",
    str(Path(__file__).parent.parent / "telos-7b2f6-098fa70d75c7.json"),
)

# API endpoint
API_ENDPOINT = f"{LOCATION}-speech.googleapis.com"


def get_current_time() -> int:
    """Return current time in milliseconds."""
    return int(round(time.time() * 1000))


class STTStreamingService:
    """
    Google Cloud Speech-to-Text v2 Streaming Service
    """

    def __init__(self):
        """Initialize the STT service with Google Cloud credentials."""
        # Set credentials
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_PATH

        # Initialize client with regional endpoint
        self.client = SpeechClient(
            client_options=ClientOptions(api_endpoint=API_ENDPOINT)
        )

        # Create recognizer path
        self.recognizer = self.client.recognizer_path(PROJECT_ID, LOCATION, "_")

        # Session tracking
        self.start_time = get_current_time()
        self.restart_counter = 0
        self.last_transcript_was_final = False
        self.new_stream = True
        
        print(f"\n{'#'*80}", flush=True)
        print(f"🎙️  STT Service initialized:")
        print(f"   - Model: {MODEL}")
        print(f"   - Location: {LOCATION}")
        print(f"   - Language: {', '.join(LANGUAGE_CODES)}")
        print(f"   - Audio: LINEAR16, 48kHz, Mono")
        print(f"   - Interim results: Enabled (real-time)")
        print(f"   - Voice activity events: Enabled")
        print(f"{'#'*80}\n", flush=True)

    def _create_config_request(self) -> cloud_speech_types.StreamingRecognizeRequest:
        """
        Create the initial configuration request for streaming recognition.

        Returns:
            StreamingRecognizeRequest with configuration
        """
        # Use explicit decoding for LINEAR16 PCM audio at 48kHz (browser default)
        recognition_config = cloud_speech_types.RecognitionConfig(
            explicit_decoding_config=cloud_speech_types.ExplicitDecodingConfig(
                encoding=cloud_speech_types.ExplicitDecodingConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=48000,  # Browser AudioContext default
                audio_channel_count=1,
            ),
            language_codes=LANGUAGE_CODES,
            model=MODEL,
        )

        streaming_config = cloud_speech_types.StreamingRecognitionConfig(
            config=recognition_config,
            streaming_features=cloud_speech_types.StreamingRecognitionFeatures(
                interim_results=True,
                enable_voice_activity_events=True,  # Get more frequent updates
                voice_activity_timeout=cloud_speech_types.StreamingRecognitionFeatures.VoiceActivityTimeout(
                    speech_start_timeout=None,  # No timeout for speech start
                    speech_end_timeout=None,  # No timeout for speech end
                ),
            ),
        )

        config_request = cloud_speech_types.StreamingRecognizeRequest(
            recognizer=self.recognizer,
            streaming_config=streaming_config,
        )

        return config_request

    def _requests_generator(
        self,
        config_request: cloud_speech_types.StreamingRecognizeRequest,
        audio_queue: queue.Queue,
    ):
        """
        Generator that yields config first, then audio requests.

        Args:
            config_request: Initial configuration request
            audio_queue: Queue containing audio chunks

        Yields:
            StreamingRecognizeRequest objects
        """
        try:
            # First, send the configuration
            print("📤 Sending config to Google Cloud")
            yield config_request

            # Then, send audio chunks
            chunk_count = 0
            empty_count = 0
            while True:
                try:
                    # Get audio chunk from queue (non-blocking with timeout)
                    audio_chunk = audio_queue.get(timeout=0.1)

                    if audio_chunk is None:
                        # None signals end of stream
                        print(f"🛑 End of audio stream (sent {chunk_count} chunks)")
                        break

                    chunk_count += 1
                    # Log every 20 chunks for better visibility  
                    if chunk_count % 20 == 0:
                        print(f"📤 Sent {chunk_count} audio chunks to Google Cloud", flush=True)
                    
                    yield cloud_speech_types.StreamingRecognizeRequest(
                        audio=audio_chunk
                    )

                except queue.Empty:
                    # Continue waiting for more audio
                    empty_count += 1
                    if empty_count % 100 == 0:
                        print(f"⏸️ Queue empty for {empty_count * 0.1:.1f}s, waiting for audio...")
                    continue

        except Exception as e:
            print(f"Error in requests generator: {e}")
            raise

    async def stream_recognize(
        self, audio_queue: queue.Queue
    ) -> AsyncGenerator[dict, None]:
        """
        Stream audio to Google STT API and yield transcription results.

        Args:
            audio_queue: Queue containing audio chunks as bytes

        Yields:
            dict: Transcription results with format:
                {
                    'transcript': str,
                    'is_final': bool,
                    'timestamp': int,  # milliseconds
                    'confidence': float  # only for final results
                }
        """
        # Create configuration request
        config_request = self._create_config_request()

        # Create requests generator
        requests = self._requests_generator(config_request, audio_queue)

        try:
            # Start streaming recognition (blocking call, run in executor)
            loop = asyncio.get_event_loop()
            
            # Use a queue to get responses in real-time
            response_queue = asyncio.Queue()
            
            def process_responses():
                """Process Google Cloud responses in a separate thread."""
                try:
                    responses = self.client.streaming_recognize(requests)
                    for response in responses:
                        # Put response in async queue immediately
                        asyncio.run_coroutine_threadsafe(
                            response_queue.put(response), loop
                        )
                    # Stream ended normally
                    print("✅ Google Cloud stream ended normally")
                except Exception as e:
                    error_msg = str(e)
                    # Check if it's a normal termination error
                    if "OutOfRange" in error_msg or "stream ended" in error_msg.lower():
                        print("🔚 Stream ended by client")
                    elif "encoding" in error_msg.lower() or "audio data" in error_msg.lower():
                        print(f"⚠️ Audio encoding issue (likely due to early termination): {error_msg[:100]}")
                    else:
                        print(f"❌ Error in process_responses: {e}")
                finally:
                    # Always signal completion
                    asyncio.run_coroutine_threadsafe(
                        response_queue.put(None), loop
                    )
            
            # Start processing in background thread
            executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
            executor.submit(process_responses)
            
            # Process responses as they arrive
            while True:
                response = await response_queue.get()
                
                if response is None:
                    break
                # Check if we need to restart the stream (4-minute limit)
                if get_current_time() - self.start_time > STREAMING_LIMIT:
                    self.start_time = get_current_time()
                    self.restart_counter += 1
                    break

                if not response.results:
                    continue

                result = response.results[0]

                if not result.alternatives:
                    continue

                transcript = result.alternatives[0].transcript

                # Calculate timestamp (v2 API doesn't provide result_end_time)
                # Use elapsed time since session start
                current_time = get_current_time()
                elapsed_time = current_time - self.start_time
                
                corrected_time = (
                    elapsed_time
                    + (STREAMING_LIMIT * self.restart_counter)
                )

                # Show all results in real-time without final distinction
                timestamp = datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3]
                
                # Always treat as interim for continuous updates
                original_is_final = result.is_final
                result_data = {
                    "transcript": transcript,
                    "is_final": False,  # Force all as interim for continuous display
                    "timestamp": corrected_time,
                    "original_is_final": original_is_final,  # Keep for reference
                }

                # Add confidence score if available
                if result.alternatives[0].confidence:
                    result_data["confidence"] = result.alternatives[0].confidence
                
                # Print all results as they come
                marker = "✅" if original_is_final else "💬"
                print(f"[{timestamp}] {marker} 실시간 텍스트: {transcript}", flush=True)
                
                self.last_transcript_was_final = original_is_final

                # Yield immediately for real-time processing
                yield result_data

        except Exception as e:
            print(f"Error in stream_recognize: {e}")
            yield {
                "error": str(e),
                "timestamp": get_current_time(),
            }

    def reset_session(self):
        """Reset session tracking variables."""
        self.start_time = get_current_time()
        self.new_stream = True
