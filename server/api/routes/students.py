"""
Students Routes
Student profile and history management
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from db.mongodb import get_users_collection, get_attempts_collection, get_roadmaps_collection
from api.routes.auth import verify_token

router = APIRouter()


class PerformanceResponse(BaseModel):
    sectionWise: dict
    topicWise: dict
    weakTopics: List[str]


class AttemptSummary(BaseModel):
    id: str
    testName: str
    date: str
    score: int
    totalMarks: int
    percentile: float
    sections: List[dict]


@router.get("/profile")
async def get_profile(request: Request):
    """Get current user's full profile"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    
    users_col = get_users_collection()
    user = await users_col.find_one({"_id": ObjectId(payload["sub"])})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get attempt count
    attempts_col = get_attempts_collection()
    test_count = await attempts_col.count_documents({"userId": user["_id"]})
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "avatar": user.get("avatar"),
        "subscription": user["subscription"],
        "examType": "CAT",
        "targetYear": 2025,
        "stats": {
            "testsCompleted": test_count,
            "averageScore": user.get("performance", {}).get("averageScore", 0),
            "studyHours": 0,  # TODO: Track study time
            "currentStreak": 0  # TODO: Calculate streak
        },
        "performance": user.get("performance", {})
    }


@router.get("/attempts", response_model=List[AttemptSummary])
async def get_attempts(request: Request):
    """Get user's test attempt history"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    
    attempts_col = get_attempts_collection()
    attempts = []
    
    async for attempt in attempts_col.find(
        {"userId": ObjectId(payload["sub"])}
    ).sort("submittedAt", -1).limit(20):
        attempts.append(AttemptSummary(
            id=str(attempt["_id"]),
            testName=f"CAT Mock Test",  # TODO: Join with tests collection
            date=attempt["submittedAt"].isoformat(),
            score=attempt["score"]["obtained"],
            totalMarks=attempt["score"]["total"],
            percentile=attempt["score"].get("percentile", 0),
            sections=[]  # TODO: Calculate section-wise
        ))
    
    return attempts


@router.get("/attempts/{attempt_id}")
async def get_attempt_detail(attempt_id: str, request: Request):
    """Get detailed attempt with AI analysis"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    
    attempts_col = get_attempts_collection()
    attempt = await attempts_col.find_one({"_id": ObjectId(attempt_id)})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if str(attempt["userId"]) != payload["sub"]:
        raise HTTPException(status_code=403, detail="Not your attempt")
    
    return {
        "id": str(attempt["_id"]),
        "testId": str(attempt["testId"]),
        "submittedAt": attempt["submittedAt"].isoformat(),
        "score": attempt["score"],
        "responses": attempt["responses"],
        "aiAnalysis": attempt.get("aiAnalysis")
    }


@router.get("/roadmap")
async def get_roadmap(request: Request):
    """Get user's personalized roadmap"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    
    roadmaps_col = get_roadmaps_collection()
    roadmap = await roadmaps_col.find_one(
        {"userId": ObjectId(payload["sub"])},
        sort=[("generatedAt", -1)]
    )
    
    if not roadmap:
        return {"message": "No roadmap generated yet. Complete a test first!"}
    
    return {
        "id": str(roadmap["_id"]),
        "generatedAt": roadmap["generatedAt"].isoformat(),
        "focusAreas": roadmap["focusAreas"],
        "weeklyPlan": roadmap["weeklyPlan"],
        "milestones": roadmap["milestones"]
    }


@router.put("/performance")
async def update_performance(request: Request):
    """Update user performance metrics (called after test analysis)"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    
    body = await request.json()
    
    users_col = get_users_collection()
    await users_col.update_one(
        {"_id": ObjectId(payload["sub"])},
        {"$set": {
            "performance": body,
            "updatedAt": datetime.utcnow()
        }}
    )
    
    return {"message": "Performance updated"}
