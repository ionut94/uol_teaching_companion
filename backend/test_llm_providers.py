#!/usr/bin/env python3
"""
Test script to compare responses from Ollama and Gemini LLM providers
"""
import os
import time
import sys
import requests
from llm_service import get_ollama_response, get_gemini_response

# Set the Gemini API key - you can comment this line if already set in environment
os.environ['GEMINI_API_KEY'] = 'AIzaSyC8J9zOuC2WWY39Er3JCN3eCXzt1zU7ZsM'

# Check if Ollama is running
def check_ollama_server():
    try:
        response = requests.get("http://localhost:11434/api/version", timeout=5)
        if response.status_code == 200:
            return True, response.json()
        return False, f"Ollama returned unexpected status code: {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Could not connect to Ollama server. Is it running at http://localhost:11434?"
    except Exception as e:
        return False, f"Error checking Ollama server: {str(e)}"

def test_llm_providers(question, context):
    """
    Test both LLM providers with the same question and context
    """
    print("\n---------------------------------------------------")
    print(f"QUESTION: {question}")
    print("---------------------------------------------------\n")
    
    # Test Ollama
    print("Getting response from Ollama...")
    start_time = time.time()
    try:
        ollama_response = get_ollama_response(question, context)
        ollama_time = time.time() - start_time
        ollama_success = True
    except Exception as e:
        ollama_response = f"Error: {str(e)}"
        ollama_time = time.time() - start_time
        ollama_success = False
    
    # Test Gemini
    print("Getting response from Gemini...")
    start_time = time.time()
    try:
        gemini_response = get_gemini_response(question, context)
        gemini_time = time.time() - start_time
        gemini_success = True
    except Exception as e:
        gemini_response = f"Error: {str(e)}"
        gemini_time = time.time() - start_time
        gemini_success = False
    
    # Print results
    print("\n==================================================")
    print(f"QUESTION: {question}")
    print("==================================================\n")
    
    print(f"--- OLLAMA RESPONSE ({'SUCCESS' if ollama_success else 'FAILED'}, took {ollama_time:.2f} seconds) ---")
    print(ollama_response)
    print("\n")
    
    print(f"--- GEMINI RESPONSE ({'SUCCESS' if gemini_success else 'FAILED'}, took {gemini_time:.2f} seconds) ---")
    print(gemini_response)
    
    return {
        'ollama': {'response': ollama_response, 'time': ollama_time, 'success': ollama_success},
        'gemini': {'response': gemini_response, 'time': gemini_time, 'success': gemini_success}
    }

def run_tests():
    """Run a series of test questions on both providers"""
    # Check if Ollama server is running
    ollama_running, status = check_ollama_server()
    if not ollama_running:
        print(f"WARNING: {status}")
        print("Ollama tests may fail, but we'll continue with the test.")
    else:
        print(f"Ollama server is running: {status}")
    
    # Check if Gemini API key is set
    gemini_key = os.environ.get('GEMINI_API_KEY', '')
    if not gemini_key:
        print("WARNING: Gemini API key is not set. Gemini tests will fail.")
    else:
        print("Gemini API key is configured.")
    
    print("\nStarting tests...")
    
    # Sample context - replace with actual context from your files if desired
    sample_context = """
    # Data Mining Overview
    
    ## Definition
    Data mining is the process of discovering patterns, correlations, anomalies, and meaningful information from large amounts of data.
    
    ## Key Concepts
    - **Classification**: Predicting the class of an object based on its attributes
    - **Clustering**: Grouping similar objects together
    - **Association Rules**: Discovering relationships between variables
    - **Regression**: Predicting a continuous value
    
    ## Applications
    - Marketing analysis for customer segmentation
    - Financial fraud detection
    - Medical diagnosis
    - Web analytics
    """
    
    # Test questions
    questions = [
        "What is data mining?",
        "Explain classification in data mining",
        "What are the main applications of data mining?",
        "Compare clustering and classification"
    ]
    
    # Run tests for each question
    for question in questions:
        test_llm_providers(question, sample_context)
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    try:
        run_tests()
    except KeyboardInterrupt:
        print("\nTest interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\nTest failed with error: {str(e)}")
        sys.exit(1)