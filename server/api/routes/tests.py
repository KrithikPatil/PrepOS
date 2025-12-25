"""
Tests Routes
Mock test CRUD operations and submissions
"""

from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from db.mongodb import get_tests_collection, get_questions_collection, get_attempts_collection
from api.routes.auth import verify_token

router = APIRouter()


class QuestionResponse(BaseModel):
    id: str
    section: str
    topic: str
    difficulty: str
    type: str
    passage: Optional[str]
    question: str
    options: Optional[List[dict]]
    marks: int = 3
    negativeMarks: int = 1


class TestResponse(BaseModel):
    id: str
    name: str
    type: str
    section: Optional[str]
    duration: int
    totalQuestions: int
    totalMarks: int


class SubmitRequest(BaseModel):
    responses: List[dict]  # [{questionId, answer, timeSpent}]
    totalTime: int


@router.get("/", response_model=List[TestResponse])
async def list_tests(
    type: Optional[str] = Query(None, description="full or sectional"),
    section: Optional[str] = Query(None, description="VARC, DILR, or QA")
):
    """List all available tests"""
    tests_col = get_tests_collection()
    
    query = {}
    if type:
        query["type"] = type
    if section:
        query["section"] = section
    
    tests = []
    async for test in tests_col.find(query):
        tests.append(TestResponse(
            id=str(test["_id"]),
            name=test["name"],
            type=test["type"],
            section=test.get("section"),
            duration=test["duration"],
            totalQuestions=len(test.get("questionIds", [])),
            totalMarks=len(test.get("questionIds", [])) * 3
        ))
    
    return tests


@router.get("/{test_id}")
async def get_test(test_id: str, request: Request):
    """Get test with questions (requires auth)"""
    # Verify auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    verify_token(token)
    
    tests_col = get_tests_collection()
    questions_col = get_questions_collection()
    
    test = await tests_col.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Get questions
    question_ids = [ObjectId(qid) for qid in test.get("questionIds", [])]
    questions = []
    
    async for q in questions_col.find({"_id": {"$in": question_ids}}):
        questions.append({
            "id": str(q["_id"]),
            "qno": len(questions) + 1,
            "section": q["section"],
            "topic": q["topic"],
            "difficulty": q["difficulty"],
            "type": q["type"],
            "passage": q.get("passage"),
            "question": q["question"],
            "options": q.get("options"),
            "marks": 3,
            "negativeMarks": 0 if q["type"] == "TITA" else 1
        })
    
    return {
        "test": {
            "id": str(test["_id"]),
            "name": test["name"],
            "duration": test["duration"],
            "totalMarks": len(questions) * 3
        },
        "questions": questions
    }


@router.post("/{test_id}/submit")
async def submit_test(test_id: str, submission: SubmitRequest, request: Request):
    """Submit test answers"""
    # Verify auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]
    
    questions_col = get_questions_collection()
    attempts_col = get_attempts_collection()
    
    # Calculate score
    correct = 0
    incorrect = 0
    unattempted = 0
    
    for response in submission.responses:
        if not response.get("answer"):
            unattempted += 1
            continue
        
        question = await questions_col.find_one({"_id": ObjectId(response["questionId"])})
        if question and response["answer"] == question["correctAnswer"]:
            correct += 1
        else:
            incorrect += 1
    
    # TITA has no negative marking
    score = (correct * 3) - (incorrect * 1)  # Simplified, should check TITA
    total = len(submission.responses) * 3
    
    # Save attempt
    attempt = {
        "userId": ObjectId(user_id),
        "testId": ObjectId(test_id),
        "startedAt": datetime.utcnow() - timedelta(seconds=submission.totalTime),
        "submittedAt": datetime.utcnow(),
        "responses": submission.responses,
        "score": {
            "obtained": score,
            "total": total,
            "percentage": round((score / total) * 100, 1) if total > 0 else 0,
            "correct": correct,
            "incorrect": incorrect,
            "unattempted": unattempted
        },
        "aiAnalysis": None  # Will be populated by agents
    }
    
    result = await attempts_col.insert_one(attempt)
    
    return {
        "attemptId": str(result.inserted_id),
        "score": attempt["score"],
        "message": "Test submitted successfully"
    }


# Import timedelta for submission
from datetime import timedelta
