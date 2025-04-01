import React from 'react';
import './LLMToggle.css';

const LLMToggle = ({ currentProvider, onToggle }) => {
  return (
    <div className="llm-toggle-container">
      <span className="llm-toggle-label">LLM Provider:</span>
      <button 
        className={`llm-toggle-button ${currentProvider === 'ollama' ? 'ollama' : ''}`}
        onClick={() => onToggle('ollama')}
        aria-label="Use Ollama LLM"
        title="Local LLM using Ollama"
      >
        Ollama
      </button>
      <button 
        className={`llm-toggle-button ${currentProvider === 'gemini' ? 'gemini' : ''}`}
        onClick={() => onToggle('gemini')}
        aria-label="Use Google Gemini LLM"
        title="Google's Gemini API"
      >
        Gemini
      </button>
    </div>
  );
};

export default LLMToggle;