"""
AI Agents Routes
Endpoints for running and monitoring AI agent analysis
"""

from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import asyncio

from db.mongodb import get_attempts_collection, get_users_collection
from api.routes.auth import verify_token
from agents import architect, detective, tutor, strategist

router = APIRouter()


class AnalyzeRequest(BaseModel):
    attemptId: str


class AgentStatus(BaseModel):
    id: str
    name: str
    status: str  # pending | processing | completed | error
    output: Optional[Dict[str, Any]] = None


# In-memory status tracking (use Redis in production)
analysis_jobs: Dict[str, Dict[str, Any]] = {}


@router.post("/analyze")
async def run_analysis(req: AnalyzeRequest, request: Request, background_tasks: BackgroundTasks):
    """Start AI agent analysis for a test attempt"""
    # Verify auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]
    
    # Get attempt
    attempts_col = get_attempts_collection()
    attempt = await attempts_col.find_one({"_id": ObjectId(req.attemptId)})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if str(attempt["userId"]) != user_id:
        raise HTTPException(status_code=403, detail="Not your attempt")
    
    # Initialize job status
    job_id = req.attemptId
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
    
    # Run analysis in background
    background_tasks.add_task(run_all_agents, job_id, attempt, user_id)
    
    return {
        "jobId": job_id,
        "status": "processing",
        "message": "Analysis started"
    }


async def run_all_agents(job_id: str, attempt: dict, user_id: str):
    """Run all AI agents for analysis"""
    try:
        users_col = get_users_collection()
        attempts_col = get_attempts_collection()
        
        # Get user performance history
        user = await users_col.find_one({"_id": ObjectId(user_id)})
        user_performance = user.get("performance", {})
        
        # Run agents concurrently
        analysis_jobs[job_id]["agents"]["architect"]["status"] = "processing"
        analysis_jobs[job_id]["agents"]["detective"]["status"] = "processing"
        
        # Run Architect and Detective in parallel
        arch_result, det_result = await asyncio.gather(
            architect.run(attempt, user_performance),
            detective.run(attempt)
        )
        
        analysis_jobs[job_id]["agents"]["architect"] = {"status": "completed", "output": arch_result}
        analysis_jobs[job_id]["agents"]["detective"] = {"status": "completed", "output": det_result}
        
        # Run Tutor (needs detective output)
        analysis_jobs[job_id]["agents"]["tutor"]["status"] = "processing"
        tutor_result = await tutor.run(attempt, det_result)
        analysis_jobs[job_id]["agents"]["tutor"] = {"status": "completed", "output": tutor_result}
        
        # Run Strategist (needs all outputs)
        analysis_jobs[job_id]["agents"]["strategist"]["status"] = "processing"
        strat_result = await strategist.run(user_performance, det_result, arch_result)
        analysis_jobs[job_id]["agents"]["strategist"] = {"status": "completed", "output": strat_result}
        
        # Update attempt with AI analysis
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
        
    except Exception as e:
        print(f"Agent analysis error: {e}")
        analysis_jobs[job_id]["status"] = "error"
        analysis_jobs[job_id]["error"] = str(e)


@router.get("/status/{job_id}")
async def get_analysis_status(job_id: str, request: Request):
    """Get status of an analysis job"""
    # Verify auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    verify_token(auth_header.split(" ")[1])
    
    if job_id not in analysis_jobs:
        # Check if analysis is stored in attempt
        attempts_col = get_attempts_collection()
        attempt = await attempts_col.find_one({"_id": ObjectId(job_id)})
        
        if attempt and attempt.get("aiAnalysis"):
            return {
                "jobId": job_id,
                "status": "completed",
                "agents": {
                    "architect": {"status": "completed", "output": attempt["aiAnalysis"]["architect"]},
                    "detective": {"status": "completed", "output": attempt["aiAnalysis"]["detective"]},
                    "tutor": {"status": "completed", "output": attempt["aiAnalysis"]["tutor"]},
                    "strategist": {"status": "completed", "output": attempt["aiAnalysis"]["strategist"]},
                }
            }
        
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = analysis_jobs[job_id]
    return {
        "jobId": job_id,
        "status": job["status"],
        "agents": job["agents"]
    }
