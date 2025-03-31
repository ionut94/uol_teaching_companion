import React, { useState, useEffect, useRef } from 'react';
import './TextToSpeech.css';

const TextToSpeech = ({ text, buttonLabel = 'Listen' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synth = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Load Daniel voice when component mounts
  useEffect(() => {
    // Clean up speech synthesis when component unmounts
    return () => {
      if (isPlaying) {
        synth.current.cancel();
      }
    };
  }, [isPlaying]);

  // Find the Daniel voice from available voices
  const getDanielVoice = () => {
    const voices = synth.current.getVoices();
    // Try to find Daniel (en-GB) voice
    const danielVoice = voices.find(voice => 
      voice.name.includes('Daniel') && voice.lang.includes('en-GB')
    );
    
    // Fallback to any English voice if Daniel is not available
    if (!danielVoice) {
      const englishVoice = voices.find(voice => voice.lang.includes('en'));
      return englishVoice || voices[0];
    }
    
    return danielVoice;
  };

  // Handle speech play/pause/stop
  const handleSpeech = () => {
    if (isPlaying) {
      if (isPaused) {
        synth.current.resume();
        setIsPaused(false);
      } else {
        synth.current.pause();
        setIsPaused(true);
      }
    } else {
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set Daniel voice if available
      // We need to get voices at the time of speaking since they may load asynchronously
      utterance.voice = getDanielVoice();
      
      // Handle speech end event
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      // Handle errors
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      // Store reference to current utterance
      utteranceRef.current = utterance;
      
      // Play speech
      synth.current.speak(utterance);
      setIsPlaying(true);
    }
  };

  // Handle stop speech
  const handleStop = () => {
    synth.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="text-to-speech-container">
      {isPlaying ? (
        <div className="speech-controls">
          <button 
            className={`speech-button ${isPaused ? 'play' : 'pause'}`}
            onClick={handleSpeech}
            aria-label={isPaused ? 'Resume speech' : 'Pause speech'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button 
            className="speech-button stop"
            onClick={handleStop}
            aria-label="Stop speech"
          >
            ⏹
          </button>
        </div>
      ) : (
        <button 
          className="speech-button play"
          onClick={handleSpeech}
          disabled={!text || text.length === 0}
          aria-label={buttonLabel}
        >
          🔊 {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default TextToSpeech;