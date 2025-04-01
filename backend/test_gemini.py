#!/usr/bin/env python3
"""
Simple test script for Gemini API integration
"""
import os
import sys
from llm_service import configure_gemini, get_gemini_response
import google.generativeai as genai

def test_gemini():
    print("\n==== GEMINI API TEST ====\n")
    
    # Print original environment variable
    original_key = os.environ.get('GEMINI_API_KEY', 'Not set')
    masked_key = "Not set" if original_key == "Not set" else f"{original_key[:5]}...{original_key[-4:]}"
    print(f"Original GEMINI_API_KEY: {masked_key}")
    
    # Set API key in environment variable
    api_key = 'AIzaSyC8J9zOuC2WWY39Er3JCN3eCXzt1zU7ZsM'
    os.environ['GEMINI_API_KEY'] = api_key
    
    # Print new environment variable
    new_key = os.environ.get('GEMINI_API_KEY', 'Not set')
    masked_new_key = f"{new_key[:5]}...{new_key[-4:]}" if len(new_key) > 9 else "too short"
    print(f"New GEMINI_API_KEY: {masked_new_key}")
    
    # Explicitly configure Gemini with the API key
    print("\nConfiguring Gemini API...")
    configured = configure_gemini()
    print(f"Gemini configuration successful: {configured}")
    
    # Get available models
    print("\nChecking available Gemini models...")
    try:
        models = genai.list_models()
        print(f"Found {len(models)} models:")
        for idx, model in enumerate(models, 1):
            print(f"  {idx}. {model.name}")
    except Exception as e:
        print(f"Error listing models: {str(e)}")
    
    # Test with a simple question and context
    print("\n---- Testing Gemini Response ----")
    
    context = """
    # Data Mining Overview
    
    ## Definition
    Data mining is the process of discovering patterns, correlations, anomalies, and meaningful 
    information from large amounts of data. It involves techniques from statistics, machine learning,
    and database systems.
    
    ## Key Concepts
    - **Classification**: Predicting the class of an object based on its attributes
    - **Clustering**: Grouping similar objects together based on their attributes
    - **Association Rules**: Discovering relationships between variables
    - **Regression**: Predicting a continuous value based on other variables
    """
    
    question = "What is data mining and what are its key concepts?"
    
    print(f"\nQuestion: '{question}'")
    try:
        print("Calling get_gemini_response...")
        response = get_gemini_response(question, context)
        print("Response received")
    except Exception as e:
        print(f"Exception while getting response: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    print("\n----- GEMINI RESPONSE -----")
    print(response)
    print("\n---------------------------")
    print("Test completed successfully")

if __name__ == "__main__":
    test_gemini()