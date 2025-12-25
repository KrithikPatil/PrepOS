"""
Detective Agent
Classifies mistakes by analyzing time patterns and accuracy
Uses gemini-2.5-flash for fast pattern recognition
"""

from typing import Dict, Any, List
import json
import logging

from agents.gemini_client import (
    generate_with_retry, 
    fallback_response, 
    get_model_for_task
)
from agents.prompts import DETECTIVE_SYSTEM_PROMPT
from config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def analyze_time_patterns(responses: List[Dict]) -> Dict[str, Any]:
    """Pre-analyze time patterns before sending to AI"""
    
    if not responses:
        return {"avgTime": 0, "outliers": [], "totalAttempted": 0}
    
    times = [r.get("timeSpent", 0) for r in responses if r.get("timeSpent", 0) > 0]
    
    if not times:
        return {"avgTime": 0, "outliers": [], "totalAttempted": len(responses)}
    
    avg_time = sum(times) / len(times)
    
    # Find outliers (>2x or <0.25x average)
    outliers = []
    for i, r in enumerate(responses):
        t = r.get("timeSpent", 0)
        if t > 0:
            if t > avg_time * 2:
                outliers.append({"qno": i + 1, "time": t, "type": "slow", "ratio": round(t / avg_time, 2)})
            elif t < avg_time * 0.25:
                outliers.append({"qno": i + 1, "time": t, "type": "fast", "ratio": round(t / avg_time, 2)})
    
    return {
        "avgTime": round(avg_time, 1),
        "totalTime": sum(times),
        "outliers": outliers,
        "totalAttempted": len([r for r in responses if r.get("answer")])
    }


async def run(attempt: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze test attempt and classify mistakes
    
    Args:
        attempt: Test attempt with responses and timing data
        
    Returns:
        Classified mistakes and patterns
    """
    
    responses = attempt.get("responses", [])
    score = attempt.get("score", {})
    
    incorrect_count = score.get("incorrect", 0)
    
    # Handle perfect score
    if incorrect_count == 0:
        return {
            "totalMistakes": 0,
            "classified": 0,
            "patterns": {
                "conceptual": 0, 
                "silly": 0, 
                "timeManagement": 0, 
                "guessing": 0,
                "strategic": 0
            },
            "weakTopics": [],
            "overallTimeManagement": "good",
            "insights": [],
            "topPriorityFixes": [],
            "message": "🎉 Perfect score! No mistakes to analyze. Keep up the excellent work!",
            "status": "success"
        }
    
    # Pre-analyze time patterns
    time_analysis = analyze_time_patterns(responses)
    
    # Prepare response data for detailed analysis
    response_summary = []
    for idx, resp in enumerate(responses):
        response_summary.append({
            "qno": idx + 1,
            "section": resp.get("section", "Unknown"),
            "topic": resp.get("topic", "Unknown"),
            "difficulty": resp.get("difficulty", "medium"),
            "answered": resp.get("answer"),
            "correct": resp.get("correctAnswer"),
            "wasCorrect": resp.get("answer") == resp.get("correctAnswer"),
            "timeSpent": resp.get("timeSpent", 0),
            "avgTimeForDifficulty": {
                "easy": 60, "medium": 90, "hard": 150
            }.get(resp.get("difficulty", "medium"), 90)
        })
    
    # Build comprehensive prompt
    prompt = f"""## TEST PERFORMANCE DATA

### Overall Metrics
- **Score**: {score.get("obtained", 0)}/{score.get("total", 0)} ({score.get("percentage", 0):.1f}%)
- **Correct**: {score.get("correct", 0)} | **Incorrect**: {score.get("incorrect", 0)} | **Unattempted**: {score.get("unattempted", 0)}

### Time Analysis (Pre-computed)
- **Average Time per Question**: {time_analysis['avgTime']}s
- **Total Attempted**: {time_analysis['totalAttempted']}
- **Time Outliers** (potential issues):
{json.dumps(time_analysis['outliers'], indent=2) if time_analysis['outliers'] else "No significant outliers"}

### Detailed Response Data
```json
{json.dumps(response_summary, indent=2)}
```

---

## YOUR TASK

Analyze each incorrect answer and:

1. **Classify the Mistake Type**:
   - Conceptual (doesn't understand the topic)
   - Silly (knows the concept, made execution error)
   - Time Management (rushed or spent too long)
   - Guessing (random answer without real attempt)
   - Strategic (poor question selection)

2. **Identify Patterns**:
   - Which topics have consistent errors?
   - Is time management a systemic issue?
   - Are there signs of fatigue in later questions?

3. **Generate Actionable Insights**:
   - Specific fixes for each mistake type
   - Top 3 priority improvements

Focus on the {incorrect_count} incorrect answers. Be specific and actionable."""

    try:
        result = await generate_with_retry(
            model=get_model_for_task("mistake_analysis"),
            prompt=prompt,
            system_instruction=DETECTIVE_SYSTEM_PROMPT,
            temperature=0.3,  # Lower for analytical accuracy
            max_retries=3,
            response_format="json"
        )
        
        # Validate and enhance result
        if "totalMistakes" not in result:
            result["totalMistakes"] = incorrect_count
        if "patterns" not in result:
            result["patterns"] = {
                "conceptual": 0, "silly": 0, 
                "timeManagement": 0, "guessing": 0, "strategic": 0
            }
        if "weakTopics" not in result:
            result["weakTopics"] = []
        if "insights" not in result:
            result["insights"] = []
        if "topPriorityFixes" not in result:
            result["topPriorityFixes"] = []
        
        result["status"] = "success"
        result["timeAnalysis"] = time_analysis  # Include raw time analysis
        
        logger.info(f"Detective: Analyzed {result['totalMistakes']} mistakes, found {len(result['weakTopics'])} weak topics")
        return result
        
    except Exception as e:
        logger.error(f"Detective Agent error: {e}")
        return fallback_response("detective", str(e))
