import asyncio
from app.db.database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    async with AsyncSessionLocal() as db:
        r = await db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='complaints' ORDER BY column_name"))
        cols = [row[0] for row in r]
        print("Complaints table columns:", cols)

asyncio.run(check())
