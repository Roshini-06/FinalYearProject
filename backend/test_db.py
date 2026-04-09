import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5432/complaint_system')
        print("Connected!")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())
