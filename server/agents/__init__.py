"""
PrepOS AI Agents Package
Multi-agent system using Google GenAI with Gemini models

Agents:
- Architect: Question generation (gemini-2.5-pro)
- Detective: Mistake classification (gemini-2.5-flash)
- Tutor: Socratic explanations (gemini-2.5-pro)
- Strategist: Roadmap planning (gemini-2.5-flash)

Infrastructure:
- gemini_client: Rate limiting, retries, fallbacks
- prompts: Expert-level system prompts
"""

from . import architect, detective, tutor, strategist
from .gemini_client import generate_with_retry, fallback_response, get_model_for_task, RateLimiter

__all__ = [
    "architect", 
    "detective", 
    "tutor", 
    "strategist",
    "generate_with_retry",
    "fallback_response",
    "get_model_for_task",
    "RateLimiter"
]
