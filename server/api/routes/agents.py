"""
AI Agents Routes
Endpoints for running and monitoring AI agent analysis
"""

from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

from db.mongodb import get_attempts_collection
from api.routes.auth import verify_token
# Import centralized service
from services.analysis_service import run_analysis_pipeline, analysis_jobs, init_job_status

router = APIRouter()


class AnalyzeRequest(BaseModel):
    attemptId: str


class AgentStatus(BaseModel):
    id: str
    name: str
    status: str  # pending | processing | completed | error
    output: Optional[Dict[str, Any]] = None


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
    
    # Initialize job status using service
    job_id = req.attemptId
    init_job_status(job_id)
    
    # Run analysis in background using service
    background_tasks.add_task(run_analysis_pipeline, job_id, attempt, user_id)
    
    return {
        "jobId": job_id,
        "status": "processing",
        "message": "Analysis started"
    }


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
                    "architect": {"status": "completed", "output": attempt["aiAnalysis"].get("architect")},
                    "detective": {"status": "completed", "output": attempt["aiAnalysis"].get("detective")},
                    "tutor": {"status": "completed", "output": attempt["aiAnalysis"].get("tutor")},
                    "strategist": {"status": "completed", "output": attempt["aiAnalysis"].get("strategist")},
                }
            }
        
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = analysis_jobs[job_id]
    return {
        "jobId": job_id,
        "status": job["status"],
        "agents": job["agents"]
    }


class TutorChatRequest(BaseModel):
    attemptId: str
    questionIndex: int
    userMessage: str


@router.post("/tutor/chat")
async def tutor_chat(req: TutorChatRequest, request: Request):
    """Interactive chat with AI Tutor for a specific question"""
    from agents import tutor
    
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
    
    # Get question from responses
    responses = attempt.get("responses", [])
    if req.questionIndex < 0 or req.questionIndex >= len(responses):
        raise HTTPException(status_code=400, detail="Invalid question index")
    
    question_response = responses[req.questionIndex]
    
    # Build question object for tutor
    question_data = {
        "section": question_response.get("section", "General"),
        "topic": question_response.get("topic", "General"),
        "difficulty": question_response.get("difficulty", "medium"),
        "type": question_response.get("type", "MCQ"),
        "passage": question_response.get("passage"),
        "question": question_response.get("questionText", ""),
        "options": question_response.get("options"),
        "correctAnswer": question_response.get("correctAnswer"),
    }
    
    student_answer = question_response.get("selectedAnswer", "Not answered")
    
    # Call tutor agent
    result = await tutor.explain_question(question_data, student_answer)
    
    return {
        "success": result.get("status") == "success",
        "response": result.get("explanation", "Unable to generate response."),
        "topic": result.get("topic")
    }
