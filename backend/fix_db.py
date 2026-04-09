import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def run():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/complaint_system')
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE complaints SET category='Electricity' WHERE category='Water' AND LOWER(subject) LIKE '%light%';"))
        print('DB Update Complete.')

asyncio.run(run())
