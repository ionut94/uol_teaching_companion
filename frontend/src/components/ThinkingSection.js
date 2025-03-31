import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const ThinkingSection = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={`thinking-section ${isExpanded ? 'thinking-expanded' : ''}`}>
      <div 
        className="thinking-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="thinking-icon">►</span>
        <span className="thinking-title">AI Reasoning Process</span>
      </div>
      
      {isExpanded && (
        <div className="thinking-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ThinkingSection;