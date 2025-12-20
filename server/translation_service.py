"""
Translation Service using Google Gemini API
Real-time Korean to English translation using generate_content_stream
"""

import asyncio
import os
from typing import AsyncGenerator, Optional
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini API settings
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "")
MODEL_ID = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# System prompt for translation
SYSTEM_PROMPT = """You are a real-time simultaneous interpreter.
Translate incoming Korean text to English immediately.
Output ONLY the translated English text without any additional explanation.
Keep the translation natural and fluent.
If the input is already in English, return it as is.
Do not add any prefixes like "Translation:" or quotation marks."""


class TranslationService:
    """
    Google Gemini API based real-time translation service.
    Translates Korean text to English using generate_content_stream.
    """

    def __init__(self):
        """Initialize the translation service."""
        self.client = None
        self._initialized = False
        
        print(f"\n{'#'*80}", flush=True)
        print(f"🌐 Translation Service initialized:")
        print(f"   - Model: {MODEL_ID}")
        print(f"   - Direction: Korean → English")
        print(f"{'#'*80}\n", flush=True)

    async def connect(self) -> bool:
        """
        Initialize the Gemini client.
        
        Returns:
            bool: True if initialization successful
        """
        try:
            self.client = genai.Client(api_key=GEMINI_API_KEY)
            self._initialized = True
            print("✅ Gemini API client initialized for translation")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize Gemini API client: {e}")
            self._initialized = False
            return False

    async def translate(self, text: str, timeout: float = 10.0) -> Optional[str]:
        """
        Translate Korean text to English.
        
        Args:
            text: Korean text to translate
            timeout: Maximum time to wait for translation (seconds)
            
        Returns:
            Translated English text or None if failed
        """
        if not self._initialized or not self.client:
            print("⚠️ Gemini client not initialized, attempting to connect...")
            if not await self.connect():
                return None
        
        try:
            # Run blocking API call in executor to avoid blocking event loop
            loop = asyncio.get_event_loop()
            
            def _translate_sync():
                result_text = []
                response = self.client.models.generate_content_stream(
                    model=MODEL_ID,
                    contents=[f"{SYSTEM_PROMPT}\n\nTranslate this: {text}"]
                )
                for chunk in response:
                    if chunk.text:
                        result_text.append(chunk.text)
                return "".join(result_text)
            
            # Execute with timeout
            translated = await asyncio.wait_for(
                loop.run_in_executor(None, _translate_sync),
                timeout=timeout
            )
            return translated.strip() if translated else None
            
        except asyncio.TimeoutError:
            print(f"⚠️ Translation timeout for: {text[:50]}...")
            return None
        except Exception as e:
            print(f"❌ Translation error: {e}")
            return None

    async def translate_stream(self, text: str) -> AsyncGenerator[str, None]:
        """
        Translate text and stream the response.
        
        Args:
            text: Korean text to translate
            
        Yields:
            Translation text chunks as they arrive
        """
        if not self._initialized or not self.client:
            if not await self.connect():
                yield "[Translation Error: Not connected]"
                return
        
        try:
            response = self.client.models.generate_content_stream(
                model=MODEL_ID,
                contents=[f"{SYSTEM_PROMPT}\n\nTranslate this: {text}"]
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            print(f"❌ Translation stream error: {e}")
            yield f"[Translation Error: {str(e)}]"

    async def disconnect(self):
        """Clean up resources."""
        self._initialized = False
        self.client = None
        print("👋 Gemini API client disconnected")

    @property
    def is_connected(self) -> bool:
        """Check if client is initialized."""
        return self._initialized


# Singleton instance for reuse
_translation_service: Optional[TranslationService] = None


async def get_translation_service() -> TranslationService:
    """Get or create the translation service singleton."""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
