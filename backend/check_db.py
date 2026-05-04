import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def check_connection():
    print(f"DEBUG: Attempting to connect to: {settings.DATABASE_URL}")
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("DB SUCCESS: Database connection successful!")
            print(f"DB SUCCESS Result: {result.scalar()}")
    except Exception as e:
        print("DB FAILED: Database connection failed!")
        print(f"DB FAILED Error: {e}")
    finally:
        try:
            await engine.dispose()
        except NameError:
            pass

if __name__ == "__main__":
    asyncio.run(check_connection())
