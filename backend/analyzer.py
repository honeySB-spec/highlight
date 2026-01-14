import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    # We will handle this gracefully in the analyze function or let it error out 
    # if called without configuration.
    print("Warning: GEMINI_API_KEY not found in environment variables.")
else:
    genai.configure(api_key=api_key)

def analyze_page(text):
    """
    Analyzes the text of a PDF page and returns a list of phrases to highlight.
    """
    if not api_key:
        raise ValueError("Gemini API Key is missing. Please set GEMINI_API_KEY in .env")
        
    # Use flash lite model which might have better availability
    model = genai.GenerativeModel('models/gemini-3-flash-preview')
    
    prompt = f""" Please read through this PDF document carefully. Identify and extract the most important key points, main ideas, and crucial facts that are essential for understanding the content. Summarize these points concisely and highlight them directly within the context of the notes. Focus only on what is necessary for retaining and reviewing the material efficiently, avoiding any less relevant information. Present the highlights in a clear, organized manner to make the document easier to study and review.
    Return a valid JSON list of objects: [{{"phrase": "exact text", "details": "why"}}]
    
    Rules:
    1. "phrase" MUST match the text EXACTLY.
    2. "details" should be a detailed description of why this phrase is important.
    3. "page" should be the page number of the PDF.   
    
    Text:
    {text}
    """
    
    import time
    import random
    
    max_retries = 2
    base_delay = 20
    
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            content = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(content)
                
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "ResourceExhausted" in error_str:
                print(f"Rate limit hit on attempt {attempt+1}/{max_retries}. Waiting...")
                if attempt < max_retries - 1:
                    sleep_time = (base_delay * (2 ** attempt)) + random.uniform(0, 1)
                    time.sleep(sleep_time)
                    continue
                else:
                    raise Exception(f"Rate limit exceeded after {max_retries} attempts. Please try again later.")
            
            print(f"Attempt {attempt+1} failed with error: {e}")
            if attempt == max_retries - 1:
                 # If it's a parse error or other non-retriable error, we might return empty
                 # but for now let's be safe and return empty so one bad page doesn't crash the whole doc
                 print("Returning empty list due to repeated errors.")
                 pass

    return []
