from passlib.context import CryptContext

try:
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    hashed = pwd_context.hash("password")
    print("Hashed successfully:", hashed)
except Exception as e:
    print("Crash:", e)
