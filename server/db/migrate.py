"""
MongoDB Migration Script
Initialize collections with indexes and sample data
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()


async def run_migration():
    """Initialize MongoDB collections and indexes"""
    
    mongodb_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB_NAME", "prepos")
    
    if not mongodb_uri:
        print("❌ MONGODB_URI not set in environment")
        return
    
    print(f"🔄 Connecting to MongoDB: {db_name}")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        # ============================================
        # Create Indexes
        # ============================================
        print("\n📋 Creating indexes...")
        
        # Users collection
        await db.users.create_index("email", unique=True)
        await db.users.create_index("providerId")
        print("  ✓ users indexes created")
        
        # Tests collection
        await db.tests.create_index("type")
        await db.tests.create_index("section")
        print("  ✓ tests indexes created")
        
        # Questions collection
        await db.questions.create_index("section")
        await db.questions.create_index("topic")
        await db.questions.create_index([("section", 1), ("difficulty", 1)])
        print("  ✓ questions indexes created")
        
        # Attempts collection
        await db.attempts.create_index("userId")
        await db.attempts.create_index([("userId", 1), ("submittedAt", -1)])
        print("  ✓ attempts indexes created")
        
        # Roadmaps collection
        await db.roadmaps.create_index("userId")
        await db.roadmaps.create_index([("userId", 1), ("generatedAt", -1)])
        print("  ✓ roadmaps indexes created")
        
        # ============================================
        # Insert Sample Data
        # ============================================
        print("\n📝 Inserting sample data...")
        
        # Check if sample data exists
        existing_questions = await db.questions.count_documents({})
        if existing_questions > 0:
            print(f"  ℹ️ {existing_questions} questions already exist, skipping sample data")
        else:
            # Sample CAT questions
            sample_questions = [
                {
                    "section": "VARC",
                    "topic": "Reading Comprehension",
                    "difficulty": "medium",
                    "type": "MCQ",
                    "passage": "The digital revolution has fundamentally transformed how we consume information...",
                    "question": "What is the main argument of the passage?",
                    "options": [
                        {"key": "A", "text": "Technology has improved our lives"},
                        {"key": "B", "text": "Digital transformation affects information consumption"},
                        {"key": "C", "text": "We should limit technology use"},
                        {"key": "D", "text": "Traditional media is obsolete"}
                    ],
                    "correctAnswer": "B",
                    "explanation": "The passage focuses on how digital revolution has transformed information consumption.",
                    "avgTimeSeconds": 90
                },
                {
                    "section": "QA",
                    "topic": "Arithmetic",
                    "difficulty": "easy",
                    "type": "MCQ",
                    "passage": None,
                    "question": "If a number is increased by 20% and then decreased by 20%, what is the net percentage change?",
                    "options": [
                        {"key": "A", "text": "0%"},
                        {"key": "B", "text": "-4%"},
                        {"key": "C", "text": "4%"},
                        {"key": "D", "text": "-2%"}
                    ],
                    "correctAnswer": "B",
                    "explanation": "1.20 × 0.80 = 0.96, so net change is -4%",
                    "avgTimeSeconds": 60
                },
                {
                    "section": "QA",
                    "topic": "Algebra",
                    "difficulty": "hard",
                    "type": "TITA",
                    "passage": None,
                    "question": "If x + 1/x = 3, find the value of x³ + 1/x³",
                    "options": None,
                    "correctAnswer": "18",
                    "explanation": "Using identity: x³ + 1/x³ = (x + 1/x)³ - 3(x + 1/x) = 27 - 9 = 18",
                    "avgTimeSeconds": 120
                },
                {
                    "section": "DILR",
                    "topic": "Data Interpretation",
                    "difficulty": "medium",
                    "type": "MCQ",
                    "passage": "A company's revenue for Q1-Q4 was 120, 150, 180, and 200 crores respectively.",
                    "question": "What is the percentage increase from Q1 to Q4?",
                    "options": [
                        {"key": "A", "text": "66.67%"},
                        {"key": "B", "text": "50%"},
                        {"key": "C", "text": "80%"},
                        {"key": "D", "text": "40%"}
                    ],
                    "correctAnswer": "A",
                    "explanation": "(200-120)/120 × 100 = 66.67%",
                    "avgTimeSeconds": 75
                },
                {
                    "section": "DILR",
                    "topic": "Logical Reasoning",
                    "difficulty": "hard",
                    "type": "MCQ",
                    "passage": "Five friends A, B, C, D, E sit in a row. A is not at any end. B is to the right of A. C is not adjacent to D.",
                    "question": "If E is at the left end, who can be at the right end?",
                    "options": [
                        {"key": "A", "text": "A or D"},
                        {"key": "B", "text": "B or C"},
                        {"key": "C", "text": "C or D"},
                        {"key": "D", "text": "Only B"}
                    ],
                    "correctAnswer": "C",
                    "explanation": "Given constraints: E is left end, A not at end, B right of A. So A must be 2nd-4th, B 3rd-5th. Right end can be C or D.",
                    "avgTimeSeconds": 150
                }
            ]
            
            await db.questions.insert_many(sample_questions)
            print(f"  ✓ Inserted {len(sample_questions)} sample questions")
            
            # Create a sample test
            question_ids = await db.questions.find({}, {"_id": 1}).to_list(length=100)
            sample_test = {
                "name": "CAT 2025 Mini Mock Test",
                "type": "full",
                "section": None,
                "duration": 40,  # 40 minutes for mini mock
                "questionIds": [str(q["_id"]) for q in question_ids],
                "createdAt": datetime.utcnow()
            }
            await db.tests.insert_one(sample_test)
            print("  ✓ Created sample test")
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(run_migration())
