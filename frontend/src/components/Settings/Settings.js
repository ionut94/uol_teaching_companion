import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('Daniel (en-GB)');
  const [isSaved, setIsSaved] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [llmProviders, setLlmProviders] = useState([]);
  const [statusMessages, setStatusMessages] = useState({
    gemini: ''
  });
  
  // Load available voices on component mount
  useEffect(() => {
    const loadVoices = () => {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      
      // Filter for English voices only
      const englishVoices = voices.filter(voice => 
        voice.lang.includes('en')
      );
      
      setAvailableVoices(englishVoices);
      
      // Find and select Daniel voice if available
      const danielVoice = voices.find(voice => 
        voice.name.includes('Daniel') && voice.lang.includes('en-GB')
      );
      
      if (danielVoice) {
        setSelectedVoice(`${danielVoice.name} (${danielVoice.lang})`);
      }
    };
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
  }, []);
  
  // Fetch available LLM providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/llm-providers');
        if (response.ok) {
          const data = await response.json();
          setLlmProviders(data.providers || []);
        }
      } catch (error) {
        console.error('Failed to fetch LLM providers:', error);
      }
    };
    
    fetchProviders();
  }, []);
  
  // Handle saving Gemini API key
  const saveGeminiApiKey = async () => {
    if (!geminiApiKey.trim()) {
      setStatusMessages(prev => ({ ...prev, gemini: 'API key cannot be empty' }));
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/llm-providers/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_key: geminiApiKey })
      });
      
      if (response.ok) {
        setStatusMessages(prev => ({ ...prev, gemini: 'Gemini API key saved successfully' }));
        setTimeout(() => {
          setStatusMessages(prev => ({ ...prev, gemini: '' }));
        }, 3000);
      } else {
        setStatusMessages(prev => ({ ...prev, gemini: 'Failed to save Gemini API key' }));
      }
    } catch (error) {
      console.error('Error saving Gemini API key:', error);
      setStatusMessages(prev => ({ ...prev, gemini: 'Error saving API key' }));
    }
  };
  
  // Handle saving general settings
  const handleSave = () => {
    // In a real implementation, this would save to user preferences
    // For now, we'll just show a success message
    setIsSaved(true);
    
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };
  
  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      <section className="settings-section">
        <h3>LLM Provider Settings</h3>
        
        <div className="setting-group">
          <label>Google Gemini API Key</label>
          <div className="api-key-input">
            <input 
              type="password" 
              value={geminiApiKey} 
              onChange={e => setGeminiApiKey(e.target.value)}
              placeholder="Enter Gemini API key"
              className="settings-input"
            />
            <button 
              className="settings-button secondary"
              onClick={saveGeminiApiKey}
            >
              Save
            </button>
          </div>
          {statusMessages.gemini && (
            <p className={`status-message ${statusMessages.gemini.includes('success') ? 'success' : 'error'}`}>
              {statusMessages.gemini}
            </p>
          )}
        </div>
      </section>
      
      <section className="settings-section">
        <h3>Voice Settings</h3>
        
        <div className="setting-group">
          <label>Text-to-Speech Voice</label>
          <div className="voice-info">
            <p>Current voice: <strong>{selectedVoice}</strong></p>
            <p className="voice-note">
              For optimal performance, this application uses Daniel (en-GB) as the default voice.
              Voice selection is managed by administrators.
            </p>
          </div>
        </div>
      </section>
      
      <section className="settings-section">
        <h3>Display Settings</h3>
        
        <div className="setting-group">
          <label>Font Size</label>
          <select className="settings-select" defaultValue="medium">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </section>
      
      <div className="settings-actions">
        <button 
          className="settings-button primary"
          onClick={handleSave}
        >
          Save Settings
        </button>
        
        {isSaved && (
          <div className="settings-saved">
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;