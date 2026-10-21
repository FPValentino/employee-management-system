import jwt

from os import getenv

from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash

load_dotenv()
JWT_SECRET_KEY = getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(getenv("JWT_EXPIRE_MINUTES", "30"))

password_hash = PasswordHash.recommended()

def hash_password(plain_password: str) -> str:
    return password_hash.hash(plain_password)

def verify_password(plain_password: str, stored_hash: str) -> bool:
    return password_hash.verify(plain_password, stored_hash)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expiration_time = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode["exp"] = expiration_time

    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)