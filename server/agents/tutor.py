"""
Socratic Tutor Agent
Provides intuition-based explanations with guiding questions
Uses gemini-2.5-pro for deep explanations
"""

from typing import Dict, Any, List
import json
import logging

from agents.gemini_client import (
    generate_with_retry, 
    fallback_response, 
    get_model_for_task
)
from agents.prompts import TUTOR_SYSTEM_PROMPT
from config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


async def run(attempt: Dict[str, Any], detective_output: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate Socratic explanations for mistakes
    
    Args:
        attempt: Test attempt data
        detective_output: Output from Detective agent with classified mistakes
        
    Returns:
        Socratic explanations for each mistake
    """
    
    insights = detective_output.get("insights", [])
    patterns = detective_output.get("patterns", {})
    weak_topics = detective_output.get("weakTopics", [])
    
    # Handle no mistakes case
    if not insights:
        return {
            "lessonsReady": 0,
            "overallTheme": "No mistakes to learn from!",
            "explanations": [],
            "studyRecommendations": [
                "Continue with mock tests to maintain your performance",
                "Try harder question sets to challenge yourself"
            ],
            "message": "🎉 Amazing work! You didn't make any mistakes. Keep pushing with harder challenges!",
            "status": "success"
        }
    
    # Identify primary mistake pattern for theme
    primary_pattern = max(patterns.items(), key=lambda x: x[1])[0] if patterns and any(patterns.values()) else "mixed"
    
    # Prepare detailed mistake data for explanations
    mistakes_for_explanation = []
    for insight in insights[:5]:  # Limit to top 5 mistakes
        mistakes_for_explanation.append({
            "questionNumber": insight.get("questionNumber"),
            "section": insight.get("section", "Unknown"),
            "topic": insight.get("topic", "Unknown"),
            "mistakeType": insight.get("mistakeType"),
            "severity": insight.get("severity", "medium"),
            "reason": insight.get("reason"),
            "fix": insight.get("fix")
        })
    
    # Build comprehensive prompt
    prompt = f"""## STUDENT MISTAKE ANALYSIS

### Mistake Pattern Summary
- **Primary Issue**: {primary_pattern.replace("_", " ").title()}
- **Total Mistakes Analyzed**: {len(insights)}
- **Weak Topics Identified**: {weak_topics or ["Various topics"]}

### Pattern Breakdown
- Conceptual Errors: {patterns.get("conceptual", 0)}
- Silly Mistakes: {patterns.get("silly", 0)}
- Time Management Issues: {patterns.get("timeManagement", 0)}
- Guessing: {patterns.get("guessing", 0)}
- Strategic Errors: {patterns.get("strategic", 0)}

### Mistakes Requiring Explanation
```json
{json.dumps(mistakes_for_explanation, indent=2)}
```

---

## YOUR TASK

For each mistake above, create a **Socratic-style lesson** that:

1. **Hooks Their Attention**: Start with an interesting observation or question
2. **Acknowledges What They Did Right**: Build on their existing knowledge
3. **Asks Guiding Questions**: 2-3 questions that lead to discovery
4. **Provides Deep Intuition**: Explain WHY the concept works, not just HOW
5. **Gives a Real-World Analogy**: Make abstract concepts concrete
6. **Shows the Correct Approach**: Step-by-step solution
7. **Offers a Prevention Tip**: How to avoid this mistake next time

Remember: We want "Aha!" moments, not just solutions. Help them understand deeply.

Also identify an **overall theme** that connects these mistakes - what's the underlying issue?"""

    try:
        result = await generate_with_retry(
            model=get_model_for_task("explanation"),
            prompt=prompt,
            system_instruction=TUTOR_SYSTEM_PROMPT,
            temperature=0.6,  # Balanced for creativity and accuracy
            max_retries=3,
            response_format="json"
        )
        
        # Validate result structure
        if "explanations" not in result:
            result["explanations"] = []
        if "lessonsReady" not in result:
            result["lessonsReady"] = len(result.get("explanations", []))
        if "overallTheme" not in result:
            result["overallTheme"] = f"Focus on {primary_pattern} improvement"
        if "studyRecommendations" not in result:
            result["studyRecommendations"] = []
        if "message" not in result:
            result["message"] = f"Prepared {result['lessonsReady']} personalized lessons to help you improve!"
        
        result["status"] = "success"
        logger.info(f"Tutor: Generated {result['lessonsReady']} Socratic explanations")
        return result
        
    except Exception as e:
        logger.error(f"Tutor Agent error: {e}")
        return fallback_response("tutor", str(e))


async def explain_question(question: Dict[str, Any], student_answer: str) -> Dict[str, Any]:
    """
    Provide on-demand explanation for a specific question (AI Tutor chat)
    
    Args:
        question: Question data
        student_answer: What the student answered
        
    Returns:
        Detailed Socratic explanation
    """
    
    prompt = f"""## QUESTION FOR EXPLANATION

### Question Details
- **Section**: {question.get("section", "Unknown")}
- **Topic**: {question.get("topic", "Unknown")}
- **Difficulty**: {question.get("difficulty", "medium")}
- **Type**: {question.get("type", "MCQ")}

### The Question
{question.get("passage", "")}

**Q: {question.get("question")}**

### Options (if MCQ)
{json.dumps(question.get("options"), indent=2) if question.get("options") else "TITA - No options"}

### Student's Answer: {student_answer}
### Correct Answer: {question.get("correctAnswer")}

---

## YOUR TASK

Provide a complete Socratic explanation:

1. Start with empathy - acknowledge their attempt
2. Ask guiding questions that lead to understanding
3. Provide the intuition behind the concept
4. Show the step-by-step correct approach
5. Give a memorable tip to prevent this mistake

Be conversational, warm, and encouraging. This is a teachable moment."""

    try:
        result = await generate_with_retry(
            model=get_model_for_task("explanation"),
            prompt=prompt,
            system_instruction="""You are a friendly CAT prep tutor having a conversation with a student. 
Be warm, supportive, and use the Socratic method. 
Focus on building intuition, not just giving the answer.
Use simple language and real-world analogies where possible.""",
            temperature=0.7,
            max_retries=3,
            response_format="text"
        )
        
        return {
            "explanation": result.get("text", "I couldn't generate an explanation. Please try again."),
            "topic": question.get("topic"),
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Tutor explain_question error: {e}")
        return {
            "explanation": f"I'm having trouble generating an explanation right now. Please try again in a moment.",
            "topic": question.get("topic"),
            "status": "error",
            "error": str(e)
        }
