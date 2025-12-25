"""
Analysis Service
Orchestrates AI agents and handles data storage
"""

import asyncio
from datetime import datetime
from bson import ObjectId
from typing import Dict, Any, Optional

from db.mongodb import (
    get_users_collection,
    get_attempts_collection,
    get_questions_collection,
    get_tests_collection,
    get_roadmaps_collection,
    get_detective_collection,
    get_tutor_collection
)
from agents import architect, detective, tutor, strategist

# In-memory status tracking (shared with routes/agents.py)
# structure: { job_id: { status: str, agents: { name: { status, output } } } }
analysis_jobs: Dict[str, Dict[str, Any]] = {}

def init_job_status(job_id: str):
    """Initialize status for a new analysis job"""
    analysis_jobs[job_id] = {
        "status": "processing",
        "startedAt": datetime.utcnow(),
        "agents": {
            "architect": {"status": "pending", "output": None},
            "detective": {"status": "pending", "output": None},
            "tutor": {"status": "pending", "output": None},
            "strategist": {"status": "pending", "output": None},
        }
    }

async def run_analysis_pipeline(attempt_id: str, attempt: dict, user_id: str):
    """
    Run the full AI analysis pipeline
    1. Architect (Questions) & Detective (Mistakes) [Parallel]
    2. Tutor (Explanations) [Depends on Detective]
    3. Strategist (Roadmap) [Depends on All]
    """
    job_id = attempt_id
    if job_id not in analysis_jobs:
        init_job_status(job_id)
        
    try:
        users_col = get_users_collection()
        attempts_col = get_attempts_collection()
        
        # Agent collections
        roadmap_col = get_roadmaps_collection()
        det_col = get_detective_collection()
        tutor_col = get_tutor_collection()
        
        # Get user performance history
        user = await users_col.find_one({"_id": ObjectId(user_id)})
        user_performance = user.get("performance", {})
        
        # --- Step 1: Parallel Execution ---
        analysis_jobs[job_id]["agents"]["architect"]["status"] = "processing"
        analysis_jobs[job_id]["agents"]["detective"]["status"] = "processing"
        
        print(f"Starting Architect and Detective for {job_id}")
        
        arch_result, det_result = await asyncio.gather(
            architect.run(attempt, user_performance),
            detective.run(attempt)
        )
        
        # Save results to respective collections
        if arch_result:
            # Process Architect Output: Create real test from generated questions
            try:
                if arch_result.get("questions"):
                    questions_col = get_questions_collection()
                    tests_col = get_tests_collection()
                    
                    generated_questions = []
                    for q in arch_result["questions"]:
                        question_doc = {
                            "section": q.get("section", "General"),
                            "topic": q.get("topic", "General"),
                            "difficulty": "medium",
                            "type": q.get("type", "MCQ"),
                            "passage": q.get("passage"),
                            "question": q.get("question", q.get("text", "")),
                            "options": q.get("options", [
                                {"key": "A", "text": q.get("option_a", "Option A")},
                                {"key": "B", "text": q.get("option_b", "Option B")},
                                {"key": "C", "text": q.get("option_c", "Option C")},
                                {"key": "D", "text": q.get("option_d", "Option D")},
                            ]),
                            "correctAnswer": q.get("correct_answer", q.get("answer", "A")),
                            "explanation": q.get("explanation", ""),
                            "isAIGenerated": True,
                            "createdAt": datetime.utcnow(),
                            "createdBy": ObjectId(user_id),
                        }
                        generated_questions.append(question_doc)
                    
                    # Insert questions
                    if generated_questions:
                        q_result = await questions_col.insert_many(generated_questions)
                        question_ids = [str(qid) for qid in q_result.inserted_ids]
                        
                        # Create Recommended Test
                        test_doc = {
                            "name": f"Recommended Practice - {datetime.now().strftime('%d %b %H:%M')}",
                            "type": "practice",
                            "section": None,
                            "duration": len(question_ids) * 2, # 2 mins per question
                            "questionIds": question_ids,
                            "isAIGenerated": True,
                            "fromAnalysisAttemptId": ObjectId(attempt_id),
                            "createdAt": datetime.utcnow(),
                            "createdBy": ObjectId(user_id),
                        }
                        
                        t_result = await tests_col.insert_one(test_doc)
                        arch_result["generatedTestId"] = str(t_result.inserted_id)
                        print(f"Created recommended test: {t_result.inserted_id}")

            except Exception as e:
                print(f"Error creating test from architect output: {e}")

            # Note: We no longer save to agent_architect collection as per requirement
            
        if det_result:
            await det_col.insert_one({
                "attemptId": ObjectId(attempt_id),
                "userId": ObjectId(user_id),
                "createdAt": datetime.utcnow(),
                "output": det_result
            })
        
        analysis_jobs[job_id]["agents"]["architect"] = {"status": "completed", "output": arch_result}
        analysis_jobs[job_id]["agents"]["detective"] = {"status": "completed", "output": det_result}
        
        # --- Step 2: Tutor (Dependent) ---
        analysis_jobs[job_id]["agents"]["tutor"]["status"] = "processing"
        tutor_result = await tutor.run(attempt, det_result)
        
        if tutor_result:
            await tutor_col.insert_one({
                "attemptId": ObjectId(attempt_id),
                "userId": ObjectId(user_id),
                "createdAt": datetime.utcnow(),
                "output": tutor_result
            })
            
        analysis_jobs[job_id]["agents"]["tutor"] = {"status": "completed", "output": tutor_result}
        
        # --- Step 3: Strategist (Dependent) ---
        analysis_jobs[job_id]["agents"]["strategist"]["status"] = "processing"
        
        # Fetch previous roadmap to allow updates
        previous_roadmap = await roadmap_col.find_one(
            {"userId": ObjectId(user_id)},
            sort=[("generatedAt", -1)]
        )
        
        strat_result = await strategist.run(user_performance, det_result, arch_result, previous_roadmap)
        
        if strat_result:
            # Ensure generatedAt is a Date object for MongoDB consistency
            if "generatedAt" in strat_result and isinstance(strat_result["generatedAt"], str):
                try:
                    strat_result["generatedAt"] = datetime.fromisoformat(strat_result["generatedAt"])
                except ValueError:
                    strat_result["generatedAt"] = datetime.utcnow()
            else:
                 strat_result["generatedAt"] = datetime.utcnow()

            # Add User ID to document for easy fetching
            strat_result["userId"] = ObjectId(user_id)
            
            # Save to standard Roadmaps collection
            await roadmap_col.insert_one(strat_result)
            
        analysis_jobs[job_id]["agents"]["strategist"] = {"status": "completed", "output": strat_result}
        
        # --- Finalize ---
        # Update attempt with AI analysis (embedded copy for frontend speed)
        await attempts_col.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {
                "aiAnalysis": {
                    "architect": arch_result,
                    "detective": det_result,
                    "tutor": tutor_result,
                    "strategist": strat_result,
                    "completedAt": datetime.utcnow()
                }
            }}
        )
        
        # Update user performance based on detective findings
        weak_topics = det_result.get("weakTopics", [])
        if weak_topics:
            await users_col.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"performance.weakTopics": weak_topics}}
            )
        
        analysis_jobs[job_id]["status"] = "completed"
        print(f"Analysis pipeline completed for {job_id}")
        
    except Exception as e:
        print(f"Agent analysis error: {e}")
        analysis_jobs[job_id]["status"] = "error"
        analysis_jobs[job_id]["error"] = str(e)
