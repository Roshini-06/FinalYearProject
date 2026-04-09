from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.user import User, UserRole
from jose import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="placeholder_unused")

async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate Clerk credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the Clerk JWT purely to extract the 'sub' (User ID)
        unverified_payload = jwt.get_unverified_claims(token)
        clerk_id = unverified_payload.get("sub")
        
        # Read email from custom header (injected by frontend interceptor)
        email = request.headers.get("X-User-Email") or unverified_payload.get("email")
        
        if not clerk_id or not email:
            print(f"Missing clerk_id ({clerk_id}) or email ({email})")
            raise credentials_exception
            
        # Find user safely by exact email match
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            # Sync user creation
            user = User(email=email, role=UserRole.USER, hashed_password="passwordless")
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
        return user
        
    except Exception as e:
        print(f"Clerk verification error: {e}")
        raise credentials_exception

async def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
