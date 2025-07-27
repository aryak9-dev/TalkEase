import firebase_admin
from firebase_admin import credentials, auth

if not firebase_admin._apps:
    cred = credentials.Certificate("C:/Users/hp/Desktop/Project/Talk-Ease/talkease-d404e-firebase-adminsdk-fbsvc-899cf3b3c0.json")
    firebase_admin.initialize_app(cred)