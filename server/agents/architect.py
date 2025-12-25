"""
Architect Agent
Generates personalized practice questions based on weak areas
Uses gemini-2.5-pro for complex reasoning
"""

from typing import Dict, Any
import json
import logging

from agents.gemini_client import (
    generate_with_retry, 
    fallback_response, 
    get_model_for_task
)
from agents.prompts import ARCHITECT_SYSTEM_PROMPT
from config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


async def run(attempt: Dict[str, Any], user_performance: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate personalized questions based on attempt and performance
    
    Args:
        attempt: Test attempt data with responses
        user_performance: User's historical performance data
        
    Returns:
        Generated questions and analysis
    """
    
    # Extract weak topics and performance data
    weak_topics = user_performance.get("weakTopics", [])
    section_performance = user_performance.get("sectionWise", {})
    topic_performance = user_performance.get("topicWise", {})
    
    # Identify lowest performing sections
    if section_performance:
        sorted_sections = sorted(section_performance.items(), key=lambda x: x[1])
        focus_sections = [s[0] for s in sorted_sections[:2]]
    else:
        focus_sections = ["QA", "DILR"]
    
    # Get lowest performing topics
    if topic_performance:
        sorted_topics = sorted(topic_performance.items(), key=lambda x: x[1])
        weak_topics_from_perf = [t[0] for t in sorted_topics[:3]]
    else:
        weak_topics_from_perf = []
    
    # Combine weak topics
    all_weak_topics = list(set(weak_topics + weak_topics_from_perf))
    
    # Extract score info
    score = attempt.get("score", {})
    
    # Build comprehensive prompt
    prompt = f"""## STUDENT PERFORMANCE DATA

### Overall Test Performance
- **Score**: {score.get("obtained", 0)}/{score.get("total", 0)} ({score.get("percentage", 0):.1f}%)
- **Correct**: {score.get("correct", 0)} | **Incorrect**: {score.get("incorrect", 0)} | **Unattempted**: {score.get("unattempted", 0)}

### Section-wise Performance
{json.dumps(section_performance, indent=2) if section_performance else "No section data available"}

### Identified Weak Topics
{all_weak_topics if all_weak_topics else "Not yet identified - generate diverse questions across sections"}

### Focus Sections (Priority)
{focus_sections}

---

## YOUR TASK

Generate **5 high-quality CAT practice questions** for this student:

1. **2 questions** from their weakest section ({focus_sections[0] if focus_sections else "QA"})
2. **2 questions** targeting specific weak topics (if identified) or common CAT topics
3. **1 question** from their second weakest area for variety

### Difficulty Distribution
- 1 Easy (build confidence)
- 3 Medium (core CAT level)
- 1 Hard (stretch challenge)

### Requirements
- At least 1 TITA (Type In The Answer) question
- Each question must have a detailed explanation
- Wrong options should be plausible (based on common mistakes)

Generate questions that will help this specific student improve. Make them CAT-worthy!"""

    try:
        result = await generate_with_retry(
            model=get_model_for_task("question_generation"),
            prompt=prompt,
            system_instruction=ARCHITECT_SYSTEM_PROMPT,
            temperature=0.75,  # Slightly higher for creative question generation
            max_retries=3,
            response_format="json"
        )
        
        # Validate result structure
        if "questions" not in result:
            result["questions"] = []
        if "generatedQuestions" not in result:
            result["generatedQuestions"] = len(result.get("questions", []))
        if "targetTopics" not in result:
            result["targetTopics"] = all_weak_topics or ["General CAT Topics"]
        if "message" not in result:
            result["message"] = f"Generated {result['generatedQuestions']} questions targeting your weak areas."
        
        result["status"] = "success"
        logger.info(f"Architect: Generated {result['generatedQuestions']} questions")
        return result
        
    except Exception as e:
        logger.error(f"Architect Agent error: {e}")
        return fallback_response("architect", str(e))
