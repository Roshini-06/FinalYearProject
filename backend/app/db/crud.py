from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any

class CRUDUtils:
    @staticmethod
    async def get_all(db: AsyncIOMotorDatabase, collection_name: str) -> List[Dict[str, Any]]:
        cursor = db[collection_name].find()
        return await cursor.to_list(length=100)

    @staticmethod
    async def create_one(db: AsyncIOMotorDatabase, collection_name: str, data: Dict[str, Any]) -> Any:
        return await db[collection_name].insert_one(data)

crud_utils = CRUDUtils()
