import os
import requests
import json
import time
import random
from dotenv import load_dotenv

load_dotenv()

# Configure Ollama
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

def analyze_page(text):
    """
    Analyzes the text of a PDF page and returns a list of phrases to highlight using local Ollama.
    """
    
    prompt = f"""Please read through this PDF document carefully. Identify and extract the most important key points, main ideas, and crucial facts that are essential for understanding the content. Summarize these points concisely and highlight them directly within the context of the notes. Focus only on what is necessary for retaining and reviewing the material efficiently, avoiding any less relevant information. Present the highlights in a clear, organized manner to make the document easier to study and review.
    
    You must output ONLY a valid JSON list of objects. Do not add any markdown formatting or explanation.
    Format: [{{"phrase": "exact text from source", "details": "reason for importance"}}]
    
    Rules:
    1. "phrase" MUST match the text in the source EXACTLY. copy-paste style.
    2. "details" should range from a few words to a sentence.
    
    Text:
    {text}
    """
    
    max_retries = 2
    base_delay = 1
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json" 
                },
                timeout=120 # Local LLMs can be slow
            )
            
            response.raise_for_status()
            result = response.json()
            content = result.get("response", "")
            
            # Cleanup potential markdown if the model ignores instruction (some older models do)
            content = content.replace('```json', '').replace('```', '').strip()
            
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict):
                    # Handle case where model returns single object instead of list
                    return [parsed]
                elif isinstance(parsed, list):
                    return parsed
                else:
                    return []
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Ollama: {content[:100]}...")
                # If it failed, maybe try to salvage or just retry
                pass
                
        except Exception as e:
            print(f"Attempt {attempt+1} failed with error: {e}")
            if attempt < max_retries - 1:
                time.sleep(base_delay * (attempt + 1))
            else:
                print("Returning empty list due to repeated errors.")
                return []

    return []
