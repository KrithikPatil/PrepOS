"""
Robust Gemini Client
Handles rate limiting, retries, and fallbacks for Google Gemini API
"""

import asyncio
import time
from typing import Optional, Dict, Any
from functools import wraps
import logging

from google import genai
from google.genai import types

from config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Configure the Gemini client
client = genai.Client(api_key=settings.gemini_api_key)


class RateLimiter:
    """
    Token bucket rate limiter for API calls
    Gemini Free Tier: 15 RPM (requests per minute)
    Gemini Pay-as-you-go: 360 RPM
    """
    
    def __init__(self, requests_per_minute: int = 15, burst_limit: int = 5):
        self.rpm = requests_per_minute
        self.burst_limit = burst_limit
        self.tokens = burst_limit
        self.last_update = time.time()
        self.lock = asyncio.Lock()
    
    async def acquire(self):
        """Wait until a token is available"""
        async with self.lock:
            now = time.time()
            time_passed = now - self.last_update
            
            # Replenish tokens based on time passed
            self.tokens = min(
                self.burst_limit,
                self.tokens + (time_passed * self.rpm / 60)
            )
            self.last_update = now
            
            if self.tokens < 1:
                # Calculate wait time
                wait_time = (1 - self.tokens) * 60 / self.rpm
                logger.info(f"Rate limit: waiting {wait_time:.2f}s")
                await asyncio.sleep(wait_time)
                self.tokens = 1
            
            self.tokens -= 1
            return True


# Global rate limiter instance
rate_limiter = RateLimiter(requests_per_minute=14, burst_limit=5)


class GeminiError(Exception):
    """Custom exception for Gemini API errors"""
    def __init__(self, message: str, retryable: bool = True):
        self.message = message
        self.retryable = retryable
        super().__init__(message)


async def generate_with_retry(
    model: str,
    prompt: str,
    system_instruction: str,
    temperature: float = 0.7,
    max_retries: int = 3,
    response_format: str = "json"
) -> Dict[str, Any]:
    """
    Generate content with automatic retry, rate limiting, and error handling
    
    Args:
        model: Gemini model name (e.g., 'gemini-2.5-flash')
        prompt: User prompt
        system_instruction: System prompt for the agent
        temperature: Creativity level (0.0-1.0)
        max_retries: Maximum retry attempts
        response_format: 'json' or 'text'
    
    Returns:
        Parsed response or raw text
    """
    
    last_error = None
    
    for attempt in range(max_retries):
        try:
            # Wait for rate limit token
            await rate_limiter.acquire()
            
            # Configure generation
            config = types.GenerateContentConfig(
                temperature=temperature,
                system_instruction=system_instruction,
            )
            
            # Add JSON mode if requested
            if response_format == "json":
                config.response_mime_type = "application/json"
            
            # Make API call with timeout (120s for complex question generation)
            logger.info(f"📤 Calling Gemini API: model={model}")
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=model,
                    contents=prompt,
                    config=config
                ),
                timeout=120.0  # 120 second timeout for question generation
            )
            
            # Log raw response
            logger.info(f"📥 Gemini API response received")
            if response.text:
                logger.info(f"📄 Raw response length: {len(response.text)} chars")
                logger.debug(f"📄 Raw response preview: {response.text[:500]}...")
            
            # Parse response
            if response.text:
                if response_format == "json":
                    import json
                    try:
                        parsed = json.loads(response.text)
                        logger.info(f"✅ JSON parsed successfully. Keys: {list(parsed.keys()) if isinstance(parsed, dict) else 'array'}")
                        return parsed
                    except json.JSONDecodeError as e:
                        logger.warning(f"JSON parse error: {e}. Returning raw text.")
                        logger.warning(f"Failed JSON content: {response.text[:300]}...")
                        return {"raw_response": response.text, "parse_error": str(e)}
                return {"text": response.text}
            
            raise GeminiError("Empty response from Gemini", retryable=True)
            
        except asyncio.TimeoutError:
            last_error = GeminiError("Request timeout (60s)", retryable=True)
            logger.warning(f"Attempt {attempt + 1}/{max_retries}: Timeout")
            
        except Exception as e:
            error_str = str(e).lower()
            
            # Check if error is retryable
            retryable = any(x in error_str for x in [
                "rate limit", "quota", "429", "503", "500",
                "resource exhausted", "deadline exceeded", "temporarily"
            ])
            
            if not retryable:
                # Non-retryable errors (API key invalid, model not found, etc.)
                logger.error(f"Non-retryable error: {e}")
                raise GeminiError(str(e), retryable=False)
            
            last_error = GeminiError(str(e), retryable=True)
            logger.warning(f"Attempt {attempt + 1}/{max_retries}: {e}")
        
        # Exponential backoff
        if attempt < max_retries - 1:
            wait_time = (2 ** attempt) + (0.5 * attempt)  # 1s, 2.5s, 4.5s
            logger.info(f"Retrying in {wait_time}s...")
            await asyncio.sleep(wait_time)
    
    # All retries exhausted
    raise last_error or GeminiError("Unknown error after retries")


def fallback_response(agent_type: str, error_message: str) -> Dict[str, Any]:
    """
    Generate graceful fallback response when AI is unavailable
    """
    
    fallbacks = {
        "architect": {
            "generatedQuestions": 0,
            "targetTopics": [],
            "message": "Question generation temporarily unavailable. Please try again in a few minutes.",
            "questions": [],
            "status": "error",
            "error": error_message
        },
        "detective": {
            "totalMistakes": 0,
            "classified": 0,
            "patterns": {"conceptual": 0, "silly": 0, "timeManagement": 0, "guessing": 0},
            "weakTopics": [],
            "insights": [],
            "message": "Mistake analysis temporarily unavailable. Please try again in a few minutes.",
            "status": "error",
            "error": error_message
        },
        "tutor": {
            "lessonsReady": 0,
            "explanations": [],
            "message": "AI Tutor temporarily unavailable. Please try again in a few minutes.",
            "status": "error",
            "error": error_message
        },
        "strategist": {
            "focusAreas": [],
            "weeklyPlan": [],
            "milestones": [],
            "message": "Roadmap generation temporarily unavailable. Please try again in a few minutes.",
            "status": "error",
            "error": error_message
        }
    }
    
    return fallbacks.get(agent_type, {"status": "error", "error": error_message})


# Model selection helper
def get_model_for_task(task_type: str) -> str:
    """
    Select appropriate model based on task complexity
    
    - Complex reasoning (questions, explanations): gemini-1.5-pro
    - Pattern recognition (mistakes, planning): gemini-1.5-flash
    """
    
    model_map = {
        "question_generation": settings.model_architect,    # gemini-1.5-pro
        "mistake_analysis": settings.model_detective,       # gemini-1.5-flash
        "explanation": settings.model_tutor,                # gemini-1.5-pro
        "roadmap": settings.model_strategist,               # gemini-1.5-flash
        "chat": "gemini-1.5-flash",                         # Quick chat
        "default": "gemini-1.5-flash"
    }
    
    return model_map.get(task_type, model_map["default"])
