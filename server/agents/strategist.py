"""
Strategist Agent
Creates personalized study roadmaps based on performance
Uses gemini-2.5-flash for planning efficiency
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import json
import logging

from agents.gemini_client import (
    generate_with_retry, 
    fallback_response, 
    get_model_for_task
)
from agents.prompts import STRATEGIST_SYSTEM_PROMPT
from config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def calculate_days_until_cat() -> int:
    """Calculate days until next CAT exam (typically late November)"""
    today = datetime.now()
    
    # CAT is usually last Sunday of November
    cat_year = today.year if today.month < 11 or (today.month == 11 and today.day < 20) else today.year + 1
    
    # Approximate CAT date as November 24
    cat_date = datetime(cat_year, 11, 24)
    
    days = (cat_date - today).days
    return max(days, 1)  # At least 1 day


def get_preparation_phase(days: int) -> str:
    """Determine preparation phase based on days remaining"""
    if days > 180:
        return "foundation"
    elif days > 90:
        return "building"
    elif days > 30:
        return "intensive"
    else:
        return "final_sprint"


async def run(
    user_performance: Dict[str, Any],
    detective_output: Dict[str, Any],
    architect_output: Dict[str, Any],
    previous_roadmap: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate personalized study roadmap
    
    Args:
        user_performance: Historical performance data
        detective_output: Mistake analysis from Detective agent
        architect_output: Generated questions info from Architect
        previous_roadmap: The user's most recent roadmap (for updates)
        
    Returns:
        Personalized weekly study roadmap
    """
    
    # Calculate time context
    days_until = calculate_days_until_cat()
    prep_phase = get_preparation_phase(days_until)
    today = datetime.now()
    
    # Extract analysis data
    weak_topics = detective_output.get("weakTopics", [])
    mistake_patterns = detective_output.get("patterns", {})
    section_performance = user_performance.get("sectionWise", {})
    top_fixes = detective_output.get("topPriorityFixes", [])
    
    # Determine student level
    avg_accuracy = sum(section_performance.values()) / len(section_performance) if section_performance else 0
    if avg_accuracy >= 70:
        level = "advanced"
    elif avg_accuracy >= 50:
        level = "intermediate"
    else:
        level = "beginner"
    
    # Find biggest weakness
    if section_performance:
        weakest = min(section_performance.items(), key=lambda x: x[1])
        strongest = max(section_performance.items(), key=lambda x: x[1])
    else:
        weakest = ("Unknown", 0)
        strongest = ("Unknown", 0)
    
    # Calculate recommended hours based on phase
    hours_map = {
        "foundation": 15,
        "building": 20,
        "intensive": 25,
        "final_sprint": 30
    }
    recommended_hours = hours_map.get(prep_phase, 20)
    
    # Format previous roadmap for context
    prev_roadmap_context = "None (First Roadmap)"
    if previous_roadmap:
        # Sanitize for JSON
        def json_serial(obj):
            if isinstance(obj, (datetime, datetime.date)):
                return obj.isoformat()
            if isinstance(str(obj), str) and len(str(obj)) == 24: # rough check for ObjectId
                return str(obj)
            return str(obj)

        try:
            # Extract key parts to avoid token limits
            minimal_roadmap = {
                "generatedAt": previous_roadmap.get("generatedAt"),
                "focusAreas": previous_roadmap.get("focusAreas"),
                "milestones": previous_roadmap.get("milestones", [])[-3:], # Last 3 milestones
                "currentWeek": previous_roadmap.get("weeklyPlan", [])[0] if previous_roadmap.get("weeklyPlan") else None
            }
            prev_roadmap_context = json.dumps(minimal_roadmap, default=json_serial, indent=2)
        except Exception as e:
            logger.warning(f"Failed to serialize previous roadmap: {e}")
            prev_roadmap_context = "Error retrieving previous roadmap"

    
    # Build comprehensive prompt
    prompt = f"""## STUDENT PROFILE

### Performance Data
- **Current Level**: {level.title()}
- **Section Performance**: {json.dumps(section_performance, indent=2) if section_performance else "No data yet"}
- **Biggest Weakness**: {weakest[0]} ({weakest[1]:.0f}% accuracy)
- **Biggest Strength**: {strongest[0]} ({strongest[1]:.0f}% accuracy)

### Mistake Analysis (from Detective)
- **Weak Topics**: {weak_topics or ["Not yet identified"]}
- **Mistake Patterns**:
  - Conceptual Errors: {mistake_patterns.get("conceptual", 0)}
  - Silly Mistakes: {mistake_patterns.get("silly", 0)}
  - Time Management Issues: {mistake_patterns.get("timeManagement", 0)}
  - Guessing: {mistake_patterns.get("guessing", 0)}
- **Top Priority Fixes**: {top_fixes or ["General improvement needed"]}

### Time Context
- **Today's Date**: {today.strftime("%Y-%m-%d")} ({today.strftime("%A")})
- **Days Until CAT**: {days_until}
- **Preparation Phase**: {prep_phase.replace("_", " ").title()}
- **Recommended Weekly Hours**: {recommended_hours}

### Previous Roadmap Context
The student has an existing roadmap. Use this to maintain continuity, but adapt based on the new performance data above.
{prev_roadmap_context}

---

## YOUR TASK

Create an **UPDATED 2-week personalized roadmap** for this student:

### Update Strategy
- **If performance improved**: Advance to harder topics/drills in the new plan.
- **If performance stalled**: Add reinforcement tasks for the weak areas identified above.
- **Milestones**: Check previous milestones. If criteria met (e.g. score > X), mark as 'completed'. Create new ones if needed.

### Week Structure Guidelines
- **Phase**: {prep_phase.replace("_", " ").title()}
- Each week should have a clear theme and goal
- Include 5-6 tasks per week (balanced across week)
- Mix task types: concept_review, practice, speed_drill, mock_test, analysis, revision

### Personalization Rules
1. {"Focus heavily on weak areas" if level == "beginner" else "Balance weak and strong areas" if level == "intermediate" else "Refine and optimize strategies"}
2. {"Include silly mistake prevention drills" if mistake_patterns.get("silly", 0) > 2 else ""}
3. {"Add time management exercises" if mistake_patterns.get("timeManagement", 0) > 2 else ""}
4. {"Include confidence-building easy wins" if level == "beginner" else ""}

### Milestones
Create 2-3 meaningful milestones with:
- Specific, measurable criteria
- Realistic target dates
- Small reward suggestions

Make the roadmap specific, achievable, and motivating. This student needs a clear path to improvement!"""

    try:
        result = await generate_with_retry(
            model=get_model_for_task("roadmap"),
            prompt=prompt,
            system_instruction=STRATEGIST_SYSTEM_PROMPT,
            temperature=0.5,  # Balanced for structured planning
            max_retries=3,
            response_format="json"
        )
        
        # Enhance result with computed data
        result["daysUntilExam"] = days_until
        result["preparationPhase"] = prep_phase
        result["generatedAt"] = today.isoformat()
        
        # Validate structure
        if "studentProfile" not in result:
            result["studentProfile"] = {
                "currentLevel": level,
                "biggestStrength": strongest[0],
                "biggestWeakness": weakest[0],
                "recommendedFocus": weak_topics[0] if weak_topics else weakest[0]
            }
        if "focusAreas" not in result:
            result["focusAreas"] = weak_topics or [weakest[0]]
        if "weeklyPlan" not in result:
            result["weeklyPlan"] = []
        if "milestones" not in result:
            result["milestones"] = []
        if "weeklyHoursRecommended" not in result:
            result["weeklyHoursRecommended"] = recommended_hours
        if "message" not in result:
            result["message"] = f"Your personalized {days_until}-day roadmap to CAT is ready! Focus on {weak_topics[0] if weak_topics else 'balanced preparation'}."
        
        result["status"] = "success"
        logger.info(f"Strategist: Generated {len(result['weeklyPlan'])}-week roadmap with {len(result['milestones'])} milestones")
        return result
        
    except Exception as e:
        logger.error(f"Strategist Agent error: {e}")
        return fallback_response("strategist", str(e))
