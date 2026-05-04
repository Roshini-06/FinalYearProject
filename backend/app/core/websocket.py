from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # active_connections maps user_email: list of websocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # admin_connections is a list of connections for users with admin role
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_email: str, is_admin: bool = False):
        await websocket.accept()
        if user_email not in self.active_connections:
            self.active_connections[user_email] = []
        self.active_connections[user_email].append(websocket)
        
        if is_admin:
            self.admin_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, user_email: str):
        if user_email in self.active_connections:
            self.active_connections[user_email].remove(websocket)
            if not self.active_connections[user_email]:
                del self.active_connections[user_email]
        
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)

    async def send_personal_message(self, message: dict, user_email: str):
        if user_email in self.active_connections:
            for connection in self.active_connections[user_email]:
                await connection.send_json(message)

    async def broadcast_to_admins(self, message: dict):
        for connection in self.admin_connections:
            await connection.send_json(message)

    async def broadcast_all(self, message: dict):
        for user_conns in self.active_connections.values():
            for connection in user_conns:
                await connection.send_json(message)

manager = ConnectionManager()
