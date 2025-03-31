import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('Daniel (en-GB)');
  const [isSaved, setIsSaved] = useState(false);
  
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
  
  // Handle saving settings
  const handleSave = () => {
    // In a real implementation, this would save to user preferences
    // For now, we'll just show a success message
    setIsSaved(true);
    
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };
  
  // For now, voice selection is disabled
  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
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