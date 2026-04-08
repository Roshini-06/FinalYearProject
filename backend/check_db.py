
import asyncio
import asyncpg
from app.core.config import settings

async def check_db():
    # Parse the DATABASE_URL to get connection details
    # Example: postgresql+asyncpg://postgres:postgres@localhost:5432/complaint_system
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    print(f"Checking connection to: {url}")
    
    try:
        # Try connecting to the default 'postgres' database first to check if target exists
        conn = await asyncpg.connect("postgresql://postgres:postgres@localhost:5432/postgres")
        databases = await conn.fetch("SELECT datname FROM pg_database")
        db_names = [d['datname'] for d in databases]
        print(f"Found databases: {db_names}")
        
        target_db = "complaint_system"
        if target_db not in db_names:
            print(f"Database '{target_db}' does not exist! Creating it...")
            await conn.execute(f"CREATE DATABASE {target_db}")
            print(f"Database '{target_db}' created successfully.")
        else:
            print(f"Database '{target_db}' already exists.")
        
        await conn.close()
    except Exception as e:
        print(f"Error checking/creating database: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
