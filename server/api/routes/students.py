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
    print(f"🔍 [GET] /attempts/{attempt_id} triggered")
    
    try:
        # 1. Auth check
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        token = auth_header.split(" ")[1]
        try:
            payload = verify_token(token)
            print(f"✅ Token verified for user: {payload.get('sub')}")
        except Exception as auth_err:
             print(f"❌ Token verification failed: {auth_err}")
             raise HTTPException(status_code=401, detail="Invalid token")

        # 2. DB Connection
        try:
            attempts_col = get_attempts_collection()
            print("✅ DB Collection accessed")
        except Exception as db_conn_err:
            print(f"❌ DB Connection failed: {db_conn_err}")
            raise HTTPException(status_code=500, detail="Database connection error")

        # 3. ID Validation
        try:
            oid = ObjectId(attempt_id)
        except Exception:
            print(f"❌ Invalid ObjectId: {attempt_id}")
            raise HTTPException(status_code=400, detail="Invalid attempt ID format")
            
        # 4. Fetch Attempt
        print(f"🔍 Searching for attempt _id: {oid}")
        attempt = await attempts_col.find_one({"_id": oid})
        
        if not attempt:
            print("❌ Attempt not found in DB")
            raise HTTPException(status_code=404, detail="Attempt not found")
        
        # 5. Ownership Check
        print(f"✅ Attempt found. Owner: {attempt.get('userId')}")
        if str(attempt["userId"]) != payload["sub"]:
            print(f"❌ Ownership mismatch. Requester: {payload['sub']}")
            raise HTTPException(status_code=403, detail="Not your attempt")
        
        # 6. Response Construction
        response_data = {
            "id": str(attempt["_id"]),
            "testId": str(attempt["testId"]),
            "submittedAt": attempt["submittedAt"].isoformat() if isinstance(attempt["submittedAt"], datetime) else str(attempt["submittedAt"]),
            "score": attempt["score"],
            "responses": attempt["responses"],
            "aiAnalysis": attempt.get("aiAnalysis")
        }
        
        return serialize_mongo_doc(response_data)

    except HTTPException:
        raise
    except Exception as e:
        print(f"🔥 UNHANDLED ERROR in get_attempt_detail: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


def serialize_mongo_doc(data):
    """Recursively convert ObjectIds to strings for JSON serialization"""
    if isinstance(data, list):
        return [serialize_mongo_doc(item) for item in data]
    elif isinstance(data, dict):
        return {k: serialize_mongo_doc(v) for k, v in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data


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
        return {"success": False, "message": "No roadmap generated yet. Complete a test first!"}
    
    # Use serializer to handle all nested ObjectIds and Datetimes
    serialized_roadmap = serialize_mongo_doc(roadmap)
    
    # Ensure ID is a string (already done by serializer, but good for explicit structure)
    serialized_roadmap["id"] = serialized_roadmap["_id"]
    del serialized_roadmap["_id"]
    
    return {
        "success": True,
        "roadmap": serialized_roadmap
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
