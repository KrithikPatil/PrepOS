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
    """Get test with questions"""
    # Try to verify auth, but don't require it for now (development mode)
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            token = auth_header.split(" ")[1]
            verify_token(token)
        except Exception as e:
            print(f"⚠️ Auth warning (proceeding anyway): {e}")
    
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


class GenerateTestRequest(BaseModel):
    name: Optional[str] = None
    sections: List[str]
    difficulty: str = "medium"
    question_count: int = 20
    duration: int = 40
    focus_topics: Optional[List[str]] = []


@router.post("/generate")
async def generate_test(config: GenerateTestRequest, request: Request):
    """Generate AI test with custom questions"""
    # Verify auth
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]
    
    tests_col = get_tests_collection()
    questions_col = get_questions_collection()
    
    # Import the Architect agent for question generation
    from agents import architect
    
    # Generate test name if not provided
    test_name = config.name or f"Custom Test - {datetime.now().strftime('%d %b %Y %H:%M')}"
    
    # Prepare context for AI
    questions_per_section = config.question_count // len(config.sections)
    generated_questions = []
    
    try:
        for section in config.sections:
            # Create mock attempt and performance data for Architect
            mock_attempt = {
                "score": {"obtained": 0, "total": 0, "percentage": 0, "correct": 0, "incorrect": 0, "unattempted": 0}
            }
            user_performance = {
                "weakTopics": config.focus_topics or [],
                "sectionWise": {section: 50},  # Default 50% to trigger question generation
                "topicWise": {topic: 50 for topic in (config.focus_topics or [])}
            }
            
            # Generate questions using Architect agent
            result = await architect.run(mock_attempt, user_performance)
            
            if result.get("success") and result.get("questions"):
                for q in result["questions"]:
                    question_doc = {
                        "section": section,
                        "topic": q.get("topic", config.focus_topics[0] if config.focus_topics else "General"),
                        "difficulty": config.difficulty,
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
    
    except Exception as e:
        # Fallback: Create placeholder questions if AI fails
        print(f"AI generation failed: {e}")
        for section in config.sections:
            for i in range(questions_per_section):
                placeholder = {
                    "section": section,
                    "topic": config.focus_topics[0] if config.focus_topics else "General",
                    "difficulty": config.difficulty,
                    "type": "MCQ",
                    "passage": None,
                    "question": f"[AI Generation Pending] {section} Question {i+1} on {', '.join(config.focus_topics) or 'general topics'}",
                    "options": [
                        {"key": "A", "text": "Option A"},
                        {"key": "B", "text": "Option B"},
                        {"key": "C", "text": "Option C"},
                        {"key": "D", "text": "Option D"},
                    ],
                    "correctAnswer": "A",
                    "explanation": "AI-generated explanation will be available soon.",
                    "isAIGenerated": True,
                    "createdAt": datetime.utcnow(),
                    "createdBy": ObjectId(user_id),
                }
                generated_questions.append(placeholder)
    
    # Insert questions into MongoDB
    question_ids = []
    if generated_questions:
        result = await questions_col.insert_many(generated_questions)
        question_ids = [str(qid) for qid in result.inserted_ids]
    
    # Create test document
    test_doc = {
        "name": test_name,
        "type": "sectional" if len(config.sections) == 1 else "full",
        "section": config.sections[0] if len(config.sections) == 1 else None,
        "duration": config.duration,
        "questionIds": question_ids,
        "isAIGenerated": True,
        "difficulty": config.difficulty,
        "focusTopics": config.focus_topics,
        "createdAt": datetime.utcnow(),
        "createdBy": ObjectId(user_id),
    }
    
    test_result = await tests_col.insert_one(test_doc)
    
    return {
        "test_id": str(test_result.inserted_id),
        "message": f"Generated {len(question_ids)} questions for {test_name}",
        "question_count": len(question_ids),
    }


# Import timedelta for submission
from datetime import timedelta
