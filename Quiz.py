from http import client
from click import prompt
import httpx
from google.cloud import firestore
import json
import re
import os

db = firestore.Client()  # Firestore Client Initialize

# Your API details for quiz generation
API_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
HEADERS = {"Authorization": "Bearer your_hf_key"}  # Replace with your API key

# async def fetch_latest_lesson():
#     """Fetch the latest lesson from Firestore."""
#     lessons_ref = db.collection("lessons").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)
#     docs = lessons_ref.stream()
    
#     for doc in docs:
#         data = doc.to_dict()
#         return data.get("topic"), data.get("language")  # Return both topic & language
    
#     return None, None

# # async def generate_quiz():
# #     """Generate a quiz based on the latest learned lesson."""
# #     lesson_topic, lesson_language = await fetch_latest_lesson()
    
# #     if not lesson_topic:
# #         return {"error": "No lesson topic found in database."}

# #     prompt = f"""
# #     Create a language quiz for the topic: "{lesson_topic}" in "{lesson_language}". 
# #     The quiz should include:
# #     - 2 Multiple Choice Questions (MCQs)
# #     - 2 Fill in the Blanks
# #     - 1 Sentence Rearrangement
# #     - 1 Pronunciation word

# #     **Ensure the response is in valid JSON format only. Example:**
# #     {{
# #         "mcqs": [
# #             {{"question": "What is ...?", "options": ["A", "B", "C", "D"], "answer": "A"}}
# #         ],
# #         "fill_in_blanks": [
# #             {{"sentence": "I ____ Spanish.", "answer": "speak"}}
# #         ],
# #         "sentence_rearrangement": [
# #             {{"jumbled": "Hola! estás cómo", "answer": "¡Hola! ¿Cómo estás?"}}
# #         ],
# #         "pronunciation": [
# #             {{"word": "Encantado"}}
# #         ]
# #     }}
# #     """

#     # async with httpx.AsyncClient(timeout=30) as client:
#     #     try:
#     #         response = await client.post(
#     #             API_URL,
#     #             json={"inputs": prompt},
#     #             headers=HEADERS
#     #         )
#     #         response.raise_for_status()
#     #         return response.json()
#     #     except httpx.HTTPStatusError as e:
#     #         return {"error": f"HTTP error {e.response.status_code}", "details": e.response.text}
#     #     except httpx.TimeoutException:
#     #         return {"error": "Request timed out. Try again later."}
        
# async def generate_quiz():
#     ...
#     lesson_topic, lesson_language = await fetch_latest_lesson()
    
#     if not lesson_topic:
#         return {"error": "No lesson topic found in database."}
#     try:
#         response = await client.post(API_URL, json={"inputs": prompt}, headers=HEADERS)
#         response.raise_for_status()
#         quiz_raw = response.json()

#         # Transform to expected format
#         questions = []

#         for mcq in quiz_raw.get("mcqs", []):
#             questions.append({
#                 "type": "multiple_choice",
#                 "question": mcq.get("question"),
#                 "options": mcq.get("options"),
#                 "correct_answer": mcq.get("answer")
#             })

#         for fib in quiz_raw.get("fill_in_blanks", []):
#             questions.append({
#                 "type": "text_input",
#                 "question": fib.get("sentence"),
#                 "correct_answer": fib.get("answer")
#             })

#         for rearrange in quiz_raw.get("sentence_rearrangement", []):
#             questions.append({
#                 "type": "text_input",
#                 "question": f"Rearrange this: '{rearrange.get('jumbled')}'",
#                 "correct_answer": rearrange.get("answer")
#             })

#         for word in quiz_raw.get("pronunciation", []):
#             questions.append({
#                 "type": "text_input",
#                 "question": f"Spell this pronunciation word: {word.get('word')}",
#                 "correct_answer": word.get("word")
#             })

#         return {
#             "topic": lesson_topic,
#             "language": lesson_language,
#             "questions": questions
#         }

#     except httpx.HTTPStatusError as e:
#         return {"error": f"HTTP error {e.response.status_code}", "details": e.response.text}
#     except httpx.TimeoutException:
#         return {"error": "Request timed out. Try again later."}

async def fetch_latest_lesson():
    lessons_ref = db.collection("lessons").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)
    docs = lessons_ref.stream()
    
    for doc in docs:
        data = doc.to_dict()
        return data.get("topic"), data.get("language")
    
    return None, None


async def generate_quiz():
    lesson_topic, lesson_language = await fetch_latest_lesson()

    if not lesson_topic:
        return {"error": "No lesson topic found in database."}

    prompt = f"""
Create a language quiz for the topic: "{lesson_topic}" in "{lesson_language}". 
The quiz should include:
- 2 Multiple Choice Questions (MCQs)
- 2 Fill in the Blanks
- 1 Sentence Rearrangement


**Respond with JSON in the format:**
{{
    "mcqs": [{{"question": "...", "options": [...], "answer": "..."}}],
    "fill_in_blanks": [{{"sentence": "...", "answer": "..."}}],
    "sentence_rearrangement": [{{"jumbled": "...", "answer": "..."}}],
    
}}
"""


    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(API_URL, json={"inputs": prompt}, headers=HEADERS)
            response.raise_for_status()
            quiz_raw = response.json()

        print("🎯 API Response JSON:", quiz_raw)

        

        # if isinstance(quiz_raw, list) and len(quiz_raw) > 0:
        #     quiz_raw = quiz_raw[0]
        #     import json

        if isinstance(quiz_raw, list) and len(quiz_raw) > 0:
            raw_text = quiz_raw[0].get("generated_text", "")
            print("🧾 Raw Generated Text:", raw_text)

        try:
            json_start = raw_text.rfind("{")
            final_json_string = raw_text[json_start:]
            quiz_raw = json.loads(final_json_string)
        except Exception as e:
                
                print("❌ Failed to parse quiz JSON:", e)
                return {
            "topic": lesson_topic,
            "language": lesson_language,
            "questions": []  # Return empty so fallback works
         }


        questions = []

        for mcq in quiz_raw.get("mcqs", []):
            questions.append({
                "type": "multiple_choice",
                "question": mcq.get("question"),
                "options": mcq.get("options"),
                "correct_answer": mcq.get("answer")
            })

        for fib in quiz_raw.get("fill_in_blanks", []):
            questions.append({
                "type": "text_input",
                "question": fib.get("sentence"),
                "correct_answer": fib.get("answer")
            })

        for rearrange in quiz_raw.get("sentence_rearrangement", []):
            questions.append({
                "type": "text_input",
                "question": f"Rearrange this: '{rearrange.get('jumbled')}'",
                "correct_answer": rearrange.get("answer")
            })

        # for word in quiz_raw.get("pronunciation", []):
        #     questions.append({
        #         "type": "text_input",
        #         "question": f"Spell this pronunciation word: {word.get('word')}",
        #         "correct_answer": word.get("word")
        #     })
            

        if isinstance(quiz_raw, list) and len(quiz_raw) > 0:
            raw_text = quiz_raw[0].get("generated_text", "")
            print("🧾 Raw Generated Text:", raw_text)

        try:
        # Find all JSON objects from the generated text
           json_blocks = re.findall(r"\{(?:[^{}]|(?R))*\}", raw_text)

           if len(json_blocks) == 0:
              raise ValueError("No JSON found in generated_text")

        # Use the LAST one — that's the actual quiz!
           last_json_block = json_blocks[-1]
           quiz_raw = json.loads(last_json_block)

        except Exception as e:
            print("❌ Failed to parse quiz JSON:", e)
            return {
                "topic": lesson_topic,
                "language": lesson_language,
                "questions": []
            }


        # ✅ If nothing generated
        # if not questions:
        #     print("⚠️ No questions parsed. Returning fallback quiz.")
        #     return {
        #         "topic": lesson_topic,
        #         "language": lesson_language,
        #         "questions": [
        #             {
        #                 "type": "multiple_choice",
        #                 "question": "What is the capital of Portugal?",
        #                 "options": ["Lisbon", "Madrid", "Rome", "Paris"],
        #                 "correct_answer": "Lisbon"
        #             }
        #         ]
        #     }

        # return {
        #     "topic": lesson_topic,
        #     "language": lesson_language,
        #     "questions": questions
        # }

    except httpx.HTTPStatusError as e:
        print("❌ HTTP Error:", e)
        return {"error": f"HTTP error {e.response.status_code}", "details": await e.response.aread()}

    except httpx.TimeoutException:
        print("❌ Timeout Error")
        return {"error": "Request timed out. Try again later."}

    except Exception as ex:
        print("❌ Unknown Error:", ex)
        return {"error": "Unexpected error", "details": str(ex)}

    

