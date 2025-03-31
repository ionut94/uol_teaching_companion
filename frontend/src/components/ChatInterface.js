import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { askQuestion } from '../services/api';
import ThinkingSection from './ThinkingSection';

const ChatInterface = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Automatically scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input on initial render
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Process message text to extract thinking sections
  const processMessageContent = (text) => {
    if (!text) return { mainContent: '', thinkingContent: null };
    
    const thinkRegex = /<think>([\s\S]*?)<\/think>/;
    const match = text.match(thinkRegex);
    
    if (!match) return { mainContent: text, thinkingContent: null };
    
    const thinkingContent = match[1].trim();
    const mainContent = text.replace(thinkRegex, '').trim();
    
    return { mainContent, thinkingContent };
  };
  
  const handleSendQuestion = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    // Add user question to chat
    const userMessage = {
      id: Date.now(),
      text: question,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Get answer from backend
      const response = await askQuestion(question);
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        text: response.answer,
        sender: 'ai'
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message || 'Failed to get response'}`,
        sender: 'system'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setQuestion('');
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSendQuestion(e);
    }
  };
  
  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            Ask a question about your course materials!
            <div className="empty-state-subtitle">
              I'm here to help you understand your teaching content.
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(message => {
              const { mainContent, thinkingContent } = processMessageContent(message.text);
              return (
                <div 
                  key={message.id} 
                  className={`message ${message.sender}`}
                >
                  <div className="message-bubble">
                    {thinkingContent && <ThinkingSection content={thinkingContent} />}
                    <ReactMarkdown>{mainContent}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="message ai loading">
                <div className="message-bubble">
                  Thinking
                </div>
              </div>
            )}
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form className="question-form" onSubmit={handleSendQuestion}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your course..."
          disabled={isLoading}
          ref={inputRef}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" disabled={isLoading || !question.trim()}>
          {isLoading ? 'Sending' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
