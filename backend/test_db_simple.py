
import asyncio
import asyncpg

async def test_conn():
    try:
        conn = await asyncpg.connect("postgresql://postgres:postgres@localhost:5432/postgres")
        print("Connected to 'postgres' database.")
        await conn.close()
        
        try:
            conn = await asyncpg.connect("postgresql://postgres:postgres@localhost:5432/complaint_system")
            print("Connected to 'complaint_system' database.")
            await conn.close()
        except Exception as e:
            print(f"Error connecting to 'complaint_system': {e}")
            
    except Exception as e:
        print(f"Error connecting to postgres: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
