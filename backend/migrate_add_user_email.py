import asyncio
import sys
sys.path.insert(0, '.')

from app.db.database import AsyncSessionLocal
from sqlalchemy import text

async def migrate():
    async with AsyncSessionLocal() as db:
        # Check if column already exists
        result = await db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name='complaints' AND column_name='user_email'")
        )
        existing = result.fetchone()

        if existing:
            print("INFO: user_email column already exists. Nothing to do.")
        else:
            try:
                await db.execute(text("ALTER TABLE complaints ADD COLUMN user_email VARCHAR"))
                await db.commit()
                print("SUCCESS: user_email column added to complaints table.")
            except Exception as e:
                await db.rollback()
                print(f"ERROR: Failed to add column: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
