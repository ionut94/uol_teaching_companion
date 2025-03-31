import requests
import json

OLLAMA_API_URL = "http://localhost:11434/api/generate"

def get_llm_response(question, context):
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
