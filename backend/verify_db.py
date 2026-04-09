import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
from app.core.config import settings

async def check_db():
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = async_sessionmaker(engine, class_=AsyncSession)
        
        async with async_session() as session:
            # Test simple connection
            result = await session.execute(text("SELECT email, role FROM users LIMIT 5"))
            users = result.fetchall()
            print("Successfully Connected to PostgreSQL Database!")
            print(f"System currently has {len(users)} registered users.")
            for row in users:
                print(f"- {row.email} ({row.role})")
                
    except Exception as e:
        print(f"Database Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
