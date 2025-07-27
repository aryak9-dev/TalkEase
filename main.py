import requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect, Depends, APIRouter
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore, auth
import httpx
import os
from google.cloud import firestore
import firebase_admin.auth as fb_auth
from fastapi.security import OAuth2PasswordBearer

#Modules created by us
from firebase_config import *  
from ChatBot import store_chat_message, chat, chat_sessions 
from Lesson_Generator import generate_lesson, store_lesson_in_firestore
from Quiz import generate_quiz, fetch_latest_lesson
from auth import verify_firebase_token, oauth2_scheme


os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "C:/Users/hp/Desktop/Project/Talk-Ease/talkease-d404e-firebase-adminsdk-fbsvc-899cf3b3c0.json"
db = firestore.Client()  # Firestore Database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify domains instead of "*" for security
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

API_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
HEADERS = {"Authorization": "Bearer your_hf_key"}  # Replace with your API key

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

    try:
        user = auth.get_user_by_email(email)
        # Authenticate with your method and get token
        token = "some_generated_token"
        return {"message": "Login successful", "token": token}
    except:
        raise HTTPException(status_code=401, detail="Invalid credentials")

class LessonRequest(BaseModel):
    topic: str
    language: str

@app.get("/chat/")
async def get_chat(prompt: str):
    response = await chat(prompt)
    return {"response": response}

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    
    session_id = str(id(websocket))  # Unique session ID as string
    chat_sessions[session_id] = []

    while True:
        prompt = await websocket.receive_text()
        response = await chat(prompt, session_id)  # await here!
        await websocket.send_text(response)


@app.post("/generate_lesson/")
async def generator(request: LessonRequest):
    """API Endpoint to generate and store a lesson."""
    lesson = await generate_lesson(request.topic, request.language)
    
    if "API Error" in lesson:
        raise HTTPException(status_code=500, detail=lesson)
    
    await store_lesson_in_firestore(request.topic, request.language, lesson)  # Store in Firestore
    return {"topic": request.topic, "language": request.language, "lesson": lesson}

@app.get("/generate_quiz/")
async def quiz_endpoint():
    """Auto-fetch latest lesson topic and generate quiz."""
    quiz = await generate_quiz()
    
    if "error" in quiz:
        raise HTTPException(status_code=500, detail=quiz["error"])
    
    return quiz

@app.get("/")
def root():
    return {"message": "Welcome to the Language Learning API! How can I help you today?"}

app.include_router(router)  # Include the router for authentication endpoints