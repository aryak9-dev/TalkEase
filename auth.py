from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import firebase_admin.auth as fb_auth
import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
# from .models import LoginRequest

router = APIRouter()

class UserCredentials(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup_user(credentials: UserCredentials):
    try:
        user = fb_auth.create_user(
            email=credentials.email,
            password=credentials.password
        )
        return {"message": "User created", "uid": user.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_firebase_token(token: str):
    try:
        # Verify the token with Firebase Admin SDK
        decoded_token = auth.verify_id_token(token)
        return decoded_token  # Returns user data from the token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.post("/login")
async def login(request: UserCredentials):
    email = request.email
    password = request.password

    # Firebase login logic (you might use pyrebase or similar)
    try:
        user = auth.get_user_by_email(email)
        # Authenticate with your method and get token
        token = "some_generated_token"
        return {"message": "Login successful", "token": token}
    except:
        raise HTTPException(status_code=401, detail="Invalid credentials")