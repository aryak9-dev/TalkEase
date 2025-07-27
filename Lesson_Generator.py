import random
import re
import requests
import httpx
from google.cloud import firestore
API_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
HEADERS = {"Authorization": "Bearer your hf key"}  # Replace with your API key

db = firestore.Client()

def format_prompt(topic, language):
    """Format user input to instruct Mixtral to generate a structured, varied lesson."""

    variations = [
        "Provide a beginner-friendly lesson on",
        "Generate an interactive language lesson about",
        "Create a structured and engaging lesson covering",
        "Write a simple and easy-to-follow lesson on"
    ]

    return (
        f"{random.choice(variations)} '{topic}' in '{language}'. "
        "Ensure variety in wording and examples each time. "
        "Structure it like this:\n"
        "1️⃣ *Introduction*: One sentence introducing the topic.\n"
        "2️⃣ *Key Words & Meanings*: Bullet points with simple definitions. For each word, include:\n"
        "   - The word in the original script (e.g., Japanese)\n"
        "   - Its romaji/pronunciation (if applicable)\n"
        "   - Its English meaning\n"
        "   Example: にちゃん (nichan): Little brother\n"
        "3️⃣ *Explanation*: A short and clear explanation with examples.\n"
        "4️⃣ *Examples*: Real-life sentences with translations.\n"
        "5️⃣ *Engagement*: A fun tip, daily usage, or interactive exercise.\n"
        "👉 Make it clear, structured, and concise while *avoiding repetition*."
    )
# ----old clean text without structuring------------------------------------------------------------------  --
def clean_text(response):
    """Cleans and formats AI-generated text for better readability."""
    # Remove initial instruction block if present
    response = re.sub(
        r"1️⃣ \*\*Introduction\*\*:.*?avoiding repetition\*\*\.",
        "",
        response,
        flags=re.DOTALL
    ).strip()
    # Remove unwanted AI instructions & placeholders
    response = re.sub(r".*?Ensure variety in wording and examples each time\.", "", response, flags=re.DOTALL).strip()
    response = response.replace("<s>", "").replace("[INST]", "").replace("[/INST]", "").strip()

    # Ensure section labels are correctly formatted  
    response = re.sub(r"\*\*\s*(Introduction|Key Words & Meanings|Explanation|Examples|Engagement)\s*\*\*", r"\n**\1**", response)

    # Fix bullet points with proper spacing
    response = response.replace("- ", "\n- ")  

    # Ensure alternate line formatting
    start_match = re.search(r"1️⃣", response)
    if start_match:
        response = response[start_match.start():]

    # Remove extra markdown clutter
    response = re.sub(r"\*\*([^\*]+)\*\*", r"**\1**", response)  # Fix bold text 
    response = re.sub(r"<s>|</s>|\[INST\]|\[/INST\]", "", response).strip()

    # Ensure proper bullet point formatting
    response = response.replace("- ", "\n- ")  

    # Remove any stray headers or unwanted markdown
    response = re.sub(r"#+", "", response) 

     # --- NEW SECTION ---
    # Split into sections for structure and rejoining properly
    sections = re.split(r"\n\*\*(Introduction|Key Words & Meanings|Explanation|Examples|Engagement)\*\*", response)
    structured = {}

    # Structure the content into a dictionary for reformatting
    for i in range(1, len(sections), 2):
        header = sections[i].strip()
        content = sections[i + 1].strip()
        structured[header] = content

    # Join sections with proper formatting
    response = "\n".join(f"**{key}**\n{value}" for key, value in structured.items())


    return response.strip()

async def store_lesson_in_firestore(topic: str, language: str, lesson: str):
    lesson_data = {
        "topic": topic,
        "language": language,
        "lesson": lesson,
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    db.collection("lessons").add(lesson_data)

async def generate_lesson(topic, language):
    """Sends request to Mixtral API, cleans it, and stores it in Firestore."""
    prompt = format_prompt(topic, language)

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_length": 600,
            "temperature": 1.0,
            "top_p": 0.85
        }
    }

    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        response.encoding = 'utf-8'
        response.raise_for_status()
        result = response.json()

        if isinstance(result, list) and "generated_text" in result[0]:
            lesson = clean_text(result[0]["generated_text"])
            
            # ✅ AWAIT the Firestore save
            await store_lesson_in_firestore(topic, language, lesson)
            
            return lesson
        else:
            return "Error: Unexpected response format"

    except requests.exceptions.RequestException as e:
        return f"API Error: {str(e)}"
