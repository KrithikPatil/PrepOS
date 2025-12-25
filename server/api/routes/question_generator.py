"""
Question Generator Routes
LLM-powered question generation using Gemini API
Fetches sample questions from MongoDB for context
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import logging

from db.mongodb import get_questions_collection
from agents.gemini_client import generate_with_retry, get_model_for_task
from agents.prompts import ARCHITECT_SYSTEM_PROMPT

router = APIRouter()
logger = logging.getLogger(__name__)


class GenerateRequest(BaseModel):
    """Request model for question generation"""
    sections: List[str] = ["QA"]
    topics: Optional[List[str]] = []
    difficulty: str = "medium"
    count: int = 5
    use_ai: bool = True


async def fetch_sample_questions_from_db(
    sections: Optional[List[str]] = None,
    limit: int = 10
) -> List[dict]:
    """Fetch sample questions from MongoDB"""
    questions_col = get_questions_collection()
    
    query = {}
    if sections:
        query["section"] = {"$in": [s.upper() for s in sections]}
    
    cursor = questions_col.find(query).limit(limit)
    questions = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string for JSON serialization
    for q in questions:
        q["id"] = str(q.pop("_id", ""))
    
    return questions


@router.get("/sample")
async def get_sample_questions(
    section: Optional[str] = None,
    count: int = 5
):
    """Get sample questions from database"""
    try:
        sections = [section] if section else None
        questions = await fetch_sample_questions_from_db(sections, count)
        
        return {
            "success": True,
            "source": "database",
            "count": len(questions),
            "questions": questions
        }
    except Exception as e:
        logger.error(f"Error fetching sample questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate")
async def generate_questions(config: GenerateRequest):
    """
    Generate personalized practice questions using Gemini LLM
    Uses sample questions from database as context
    """
    
    # Fetch sample questions from database for context
    try:
        sample_questions = await fetch_sample_questions_from_db(
            sections=config.sections,
            limit=6
        )
    except Exception as e:
        logger.warning(f"Could not fetch samples from DB: {e}")
        sample_questions = []
    
    # If AI disabled or no samples, return database samples
    if not config.use_ai:
        return {
            "success": True,
            "source": "database",
            "count": len(sample_questions),
            "questions": sample_questions[:config.count]
        }
    
    # Format samples for LLM context
    # Take only 2 samples to keep prompt short
    sample_context = json.dumps(sample_questions[:2], indent=2, default=str) if sample_questions else "[]"
    
    # Build a concise generation prompt
    prompt = f"""Generate {config.count} CAT exam practice questions.

REQUIREMENTS:
- Section(s): {', '.join(config.sections)}
- Difficulty: {config.difficulty}
- Include MCQ and TITA types

EXAMPLE FORMAT:
{sample_context}

OUTPUT: Return valid JSON with this structure:
{{
  "questions": [
    {{
      "id": "GEN-001",
      "section": "QA",
      "topic": "Arithmetic",
      "difficulty": "{config.difficulty}",
      "type": "MCQ",
      "passage": null,
      "question": "Question text here",
      "options": [{{"key": "A", "text": "Option A"}}, {{"key": "B", "text": "Option B"}}, {{"key": "C", "text": "Option C"}}, {{"key": "D", "text": "Option D"}}],
      "correctAnswer": "A",
      "explanation": "Solution explanation"
    }}
  ],
  "message": "Generated {config.count} questions"
}}"""

    try:
        logger.info("=" * 60)
        logger.info("🤖 QUESTION GENERATION REQUEST")
        logger.info("=" * 60)
        logger.info(f"Sections: {config.sections}")
        logger.info(f"Topics: {config.topics}")
        logger.info(f"Difficulty: {config.difficulty}")
        logger.info(f"Count: {config.count}")
        logger.info(f"Sample questions from DB: {len(sample_questions)}")
        logger.info("-" * 60)
        logger.info("PROMPT SENT TO LLM:")
        logger.info("-" * 60)
        logger.info(prompt[:500] + "..." if len(prompt) > 500 else prompt)
        logger.info("-" * 60)
        
        # Call Gemini API using existing infrastructure
        model_name = get_model_for_task("question_generation")
        logger.info(f"Using model: {model_name}")
        
        result = await generate_with_retry(
            model=model_name,
            prompt=prompt,
            system_instruction=ARCHITECT_SYSTEM_PROMPT,
            temperature=0.8,
            max_retries=3,
            response_format="json"
        )
        
        # CRITICAL DEBUG: Print the entire result
        print("=" * 60)
        print("🔍 RAW LLM RESULT:")
        print("=" * 60)
        print(f"Result type: {type(result)}")
        print(f"Result keys: {list(result.keys()) if isinstance(result, dict) else 'NOT A DICT'}")
        print(f"Full result: {json.dumps(result, indent=2, default=str)[:3000]}")
        print("=" * 60)
        
        logger.info("=" * 60)
        logger.info("✅ LLM RESPONSE RECEIVED")
        logger.info("=" * 60)
        logger.info(f"Response keys: {list(result.keys())}")
        logger.info(f"Generated questions count: {result.get('generatedQuestions', 'N/A')}")
        logger.info(f"Target topics: {result.get('targetTopics', [])}")
        logger.info(f"Message: {result.get('message', 'N/A')}")
        
        questions = result.get("questions", [])
        print(f"Questions extracted: {len(questions)} questions")
        
        # If questions is empty, check for parsing issues or alternative structures
        if not questions:
            print("⚠️ No 'questions' key found or empty. Checking alternative structures...")
            
            # Handle case where JSON parsing failed and we have raw_response
            if "raw_response" in result:
                print("  Found 'raw_response' - attempting to parse...")
                raw = result.get("raw_response", "")
                try:
                    # Try to extract JSON from the raw response
                    import re
                    # Find JSON object in the response
                    json_match = re.search(r'\{[\s\S]*\}', raw)
                    if json_match:
                        parsed = json.loads(json_match.group())
                        questions = parsed.get("questions", [])
                        print(f"  Successfully parsed raw_response: {len(questions)} questions")
                except Exception as parse_err:
                    print(f"  Failed to parse raw_response: {parse_err}")
            
            # Try alternative keys
            if not questions and "generated_questions" in result:
                questions = result.get("generated_questions", [])
                print(f"  Found 'generated_questions': {len(questions)}")
            elif not questions and "data" in result and isinstance(result["data"], list):
                questions = result["data"]
                print(f"  Found 'data': {len(questions)}")
            # Check if the whole result is an array
            elif not questions and isinstance(result, list):
                questions = result
                print(f"  Result IS the questions array: {len(questions)}")
        
        logger.info(f"Questions array length: {len(questions)}")
        
        # Log each question briefly
        for i, q in enumerate(questions):
            logger.info(f"  Q{i+1}: [{q.get('section', '?')}] [{q.get('topic', '?')}] [{q.get('difficulty', '?')}] {q.get('type', '?')}")
            logger.info(f"       {q.get('question', 'No question text')[:80]}...")
        
        logger.info("-" * 60)
        logger.info("Full LLM response JSON:")
        logger.info(json.dumps(result, indent=2, default=str)[:2000])
        logger.info("=" * 60)
        
        # Ensure proper IDs
        for i, q in enumerate(questions):
            if "id" not in q:
                q["id"] = f"GEN-{datetime.now().strftime('%H%M%S')}-{i+1:03d}"
            
            # Format options if needed
            if q.get("options") and isinstance(q["options"], list):
                formatted_options = []
                for j, opt in enumerate(q["options"]):
                    if isinstance(opt, str):
                        key = chr(65 + j)
                        text = opt[3:] if len(opt) > 2 and opt[1:3] == ". " else opt
                        formatted_options.append({"key": key, "text": text})
                    elif isinstance(opt, dict):
                        formatted_options.append(opt)
                q["options"] = formatted_options
        
        logger.info(f"✅ Successfully processed {len(questions)} questions")
        print(f"✅ Successfully processed {len(questions)} questions")  # Console output
        
        # Store generated questions in database for future reference
        if questions:
            try:
                questions_col = get_questions_collection()
                # Add metadata for stored questions
                for q in questions:
                    q["generated"] = True
                    q["generatedAt"] = datetime.utcnow()
                    q["source"] = "ai_generated"
                # Insert into database
                await questions_col.insert_many([{k: v for k, v in q.items() if k != "id"} for q in questions])
                logger.info(f"💾 Stored {len(questions)} questions in database")
                print(f"💾 Stored {len(questions)} questions in database")
            except Exception as db_err:
                logger.warning(f"Could not store questions in DB: {db_err}")
                print(f"⚠️ Could not store questions in DB: {db_err}")
        
        # Store generated questions in database and create a test
        test_id = None
        stored_question_ids = []
        
        if questions:
            try:
                from db.mongodb import get_tests_collection
                questions_col = get_questions_collection()
                tests_col = get_tests_collection()
                
                # Prepare questions for insertion (without the temp id)
                questions_to_insert = []
                for q in questions:
                    q_copy = {k: v for k, v in q.items() if k != "id"}
                    q_copy["generated"] = True
                    q_copy["generatedAt"] = datetime.utcnow()
                    q_copy["source"] = "ai_generated"
                    questions_to_insert.append(q_copy)
                
                # Insert questions into database
                insert_result = await questions_col.insert_many(questions_to_insert)
                stored_question_ids = [str(id) for id in insert_result.inserted_ids]
                print(f"💾 Stored {len(stored_question_ids)} questions in database")
                print(f"   Question IDs: {stored_question_ids}")
                
                # Create a new test with these question IDs
                test_name = f"AI Generated - {config.sections[0] if config.sections else 'Mixed'} - {datetime.now().strftime('%d %b %Y %H:%M')}"
                test_doc = {
                    "name": test_name,
                    "type": "generated",
                    "sections": config.sections,
                    "difficulty": config.difficulty,
                    "duration": len(questions) * 2,  # 2 minutes per question
                    "questionIds": stored_question_ids,
                    "questionCount": len(stored_question_ids),
                    "createdAt": datetime.utcnow(),
                    "source": "ai_generated"
                }
                
                test_result = await tests_col.insert_one(test_doc)
                test_id = str(test_result.inserted_id)
                print(f"📝 Created test: {test_name}")
                print(f"   Test ID: {test_id}")
                
            except Exception as db_err:
                logger.warning(f"Could not store in DB: {db_err}")
                print(f"⚠️ Could not store in DB: {db_err}")
        
        return {
            "success": True,
            "source": "ai_generated",
            "count": len(questions),
            "questionIds": stored_question_ids,
            "testId": test_id,
            "testName": test_name if test_id else None,
            "targetTopics": result.get("targetTopics", config.topics or []),
            "message": f"Successfully generated {len(questions)} questions and created a practice test!"
        }
            
    except Exception as e:
        logger.error("=" * 60)
        logger.error("❌ LLM QUESTION GENERATION ERROR")
        logger.error("=" * 60)
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        print(f"❌ LLM ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        logger.error("=" * 60)
        
        # Fallback to database samples
        print(f"📚 Falling back to {len(sample_questions)} database samples")
        return {
            "success": False,
            "source": "fallback_database",
            "count": len(sample_questions),
            "ai_error": str(e),
            "message": f"AI generation failed: {str(e)[:100]}"
        }


@router.get("/topics")
async def get_available_topics():
    """Get available topics for each section from database"""
    questions_col = get_questions_collection()
    
    try:
        # Get distinct topics per section
        topics = {}
        for section in ["VARC", "DILR", "QA"]:
            section_topics = await questions_col.distinct("topic", {"section": section})
            topics[section] = section_topics if section_topics else []
        
        # Add defaults if empty
        if not topics["VARC"]:
            topics["VARC"] = ["Reading Comprehension", "Para Jumbles", "Para Summary"]
        if not topics["DILR"]:
            topics["DILR"] = ["Data Interpretation", "Logical Reasoning", "Puzzles"]
        if not topics["QA"]:
            topics["QA"] = ["Arithmetic", "Algebra", "Geometry", "Number System"]
        
        return topics
    except Exception as e:
        logger.error(f"Error fetching topics: {e}")
        return {
            "VARC": ["Reading Comprehension", "Para Jumbles"],
            "DILR": ["Data Interpretation", "Logical Reasoning"],
            "QA": ["Arithmetic", "Algebra", "Geometry"]
        }


@router.post("/generate-similar")
async def generate_similar_questions(base_question: dict, count: int = 3):
    """Generate questions similar to a given question"""
    
    prompt = f"""## TASK: Generate {count} similar questions

### Base Question (generate variations):
{json.dumps(base_question, indent=2, default=str)}

### Requirements:
- Same section: {base_question.get('section', 'QA')}
- Same topic: {base_question.get('topic', 'General')}
- Similar difficulty: {base_question.get('difficulty', 'medium')}
- Different numbers/scenarios but same concept

Return JSON with "questions" array matching the same format."""

    try:
        result = await generate_with_retry(
            model=get_model_for_task("question_generation"),
            prompt=prompt,
            system_instruction=ARCHITECT_SYSTEM_PROMPT,
            temperature=0.7,
            max_retries=2,
            response_format="json"
        )
        
        questions = result.get("questions", [])
        for i, q in enumerate(questions):
            q["id"] = f"SIM-{datetime.now().strftime('%H%M%S')}-{i+1:03d}"
        
        return {
            "success": True,
            "source": "ai_generated",
            "basedOn": base_question.get("id"),
            "count": len(questions),
            "questions": questions[:count]
        }
        
    except Exception as e:
        logger.error(f"Similar question generation error: {e}")
        return {"success": False, "error": str(e), "questions": []}
