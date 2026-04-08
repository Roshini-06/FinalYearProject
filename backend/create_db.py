
import asyncio
import asyncpg

async def create_db():
    try:
        conn = await asyncpg.connect("postgresql://postgres:postgres@localhost:5432/postgres")
        await conn.execute("CREATE DATABASE complaint_system")
        print("Database 'complaint_system' created successfully.")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_db())
