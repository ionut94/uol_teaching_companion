import React, { useState, useEffect } from 'react';
import './LLMToggle.css';

const LLMToggle = ({ currentProvider, onToggle }) => {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available LLM providers from the backend
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/llm-providers');
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || []);
        } else {
          console.error('Failed to fetch LLM providers');
        }
      } catch (error) {
        console.error('Error fetching LLM providers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Handle dropdown selection change
  const handleChange = (e) => {
    onToggle(e.target.value);
  };

  return (
    <div className="llm-toggle-container">
      <span className="llm-toggle-label">LLM Provider:</span>
      {isLoading ? (
        <span className="llm-loading">Loading providers...</span>
      ) : (
        <select 
          className="llm-selector"
          value={currentProvider}
          onChange={handleChange}
          aria-label="Select LLM provider"
        >
          {providers.map(provider => (
            <option 
              key={provider.id} 
              value={provider.id}
              disabled={provider.status !== 'configured'}
            >
              {provider.name} {provider.status !== 'configured' ? '(not configured)' : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default LLMToggle;