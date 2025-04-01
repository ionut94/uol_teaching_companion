import requests
import json
import re
import os
from better_profanity import profanity
import google.generativeai as genai

# API URLs and configurations
OLLAMA_API_URL = "http://localhost:11434/api/generate"
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Initialize the profanity filter
profanity.load_censor_words()

# Configure Gemini API if key is available
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def configure_gemini():
    """
    Configure the Gemini API with the current API key.
    This function can be called at any time to reconfigure the API.
    """
    api_key = os.environ.get('GEMINI_API_KEY', '')
    if api_key:
        genai.configure(api_key=api_key)
        return True
    return False

def contains_inappropriate_content(text):
    """
    Check if the text contains inappropriate content using the better-profanity package.
    
    Args:
        text (str): The text to check
        
    Returns:
        bool: True if inappropriate content detected, False otherwise
    """
    # Check if the text contains any profanity
    return profanity.contains_profanity(text)

def get_gemini_response(question, context):
    """
    Get a response from Google's Gemini API.
    
    Args:
        question (str): The question asked by the student
        context (str): The context from PDF slides
        
    Returns:
        str: LLM response
    """
    # Always try to configure with the current environment variable
    if not configure_gemini():
        return "Error: Gemini API key not configured. Please set the GEMINI_API_KEY environment variable."
    
    try:
        # Create the same prompt structure for consistency
        prompt = f"""You are an educational assistant helping students understand course material.
Use the following information from course slides to answer the student's question.
If the answer isn't in the provided context, say so and don't make up an answer.
The context may contain LaTeX math equations, which you should interpret correctly.

CONTEXT:
{context}

STUDENT QUESTION:
{question}

YOUR ANSWER:
"""
        # List available models
        models = list(genai.list_models())
        model_names = [model.name for model in models]
        print(f"Available Gemini models: {model_names}")
        
        # Set gemini-2.0-flash as the preferred model
        preferred_model = 'models/gemini-2.0-flash'
        
        # Check if our preferred model is available
        if preferred_model in model_names:
            model_name = preferred_model
            print(f"Using requested model: {model_name}")
        else:
            # Models to try, in order of alternative preference
            alternative_models = [
                'models/gemini-1.5-pro',
                'models/gemini-pro',
                'models/gemini-1.0-pro',
                'models/gemini-1.5-flash'
            ]
            
            # Check for alternative models
            model_name = None
            for alt_model in alternative_models:
                if alt_model in model_names:
                    model_name = alt_model
                    print(f"Preferred model not found. Using alternative model: {model_name}")
                    break
                    
            # If we still couldn't find a model, look for any gemini model
            if not model_name:
                for name in model_names:
                    if 'gemini' in name.lower() and not name.endswith('-vision'):
                        model_name = name
                        print(f"Using available Gemini model: {model_name}")
                        break
            
            # As a last resort, try the first model in the list
            if not model_name and model_names:
                model_name = model_names[0]
                print(f"No Gemini models found. Using fallback model: {model_name}")
                
        if not model_name:
            return "Error: No Gemini models available. Check your API key and permissions."
        
        # Configure the model with the found model name
        model = genai.GenerativeModel(model_name)
        
        # Generate content
        response = model.generate_content(prompt)
        
        # Return the text response
        return response.text
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Error communicating with Gemini API: {str(e)}"

def get_ollama_response(question, context):
    """
    Get a response from the local Ollama LLM.
    
    Args:
        question (str): The question asked by the student
        context (str): The context from PDF slides
        
    Returns:
        str: LLM response
    """
    # Create a prompt that includes the context and question
    prompt = f"""You are an educational assistant helping students understand course material.
Use the following information from course slides to answer the student's question.
If the answer isn't in the provided context, say so and don't make up an answer.
The context may contain LaTeX math equations, which you should interpret correctly.

CONTEXT:
{context}

STUDENT QUESTION:
{question}

YOUR ANSWER:
"""
    
    try:
        # Request to Ollama API
        data = {
            "model": "deepseek-r1:7b-qwen-distill-q4_K_M", # Use the model you have available in Ollama
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(OLLAMA_API_URL, json=data)
        
        if response.status_code == 200:
            result = response.json()
            return result.get('response', "Sorry, I couldn't generate a response.")
        else:
            return f"Error: API returned status code {response.status_code}"
            
    except Exception as e:
        return f"Error communicating with LLM: {str(e)}"

def get_llm_response(question, context, provider='ollama'):
    """
    Get a response from the chosen LLM provider.
    
    Args:
        question (str): The question asked by the student
        context (str): The context from PDF slides
        provider (str): The LLM provider to use ('ollama' or 'gemini')
        
    Returns:
        str: LLM response
    """
    # Use the appropriate provider
    if provider.lower() == 'gemini':
        return get_gemini_response(question, context)
    else:
        return get_ollama_response(question, context)
