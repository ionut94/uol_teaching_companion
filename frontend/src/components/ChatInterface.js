import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { askQuestion, askQuestionWithHistory, getChatMessages } from '../services/api';
import ThinkingSection from './ThinkingSection';
import TextToSpeech from './TextToSpeech/TextToSpeech';
import LLMToggle from './LLMToggle/LLMToggle';

const ChatInterface = ({ activeChatId, isAuthenticated }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [llmProvider, setLlmProvider] = useState('ollama'); // Default to ollama
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load messages if chat ID is provided and user is authenticated
  useEffect(() => {
    if (activeChatId && isAuthenticated) {
      loadChatHistory(activeChatId);
    } else {
      // Reset messages if not viewing a specific chat
      setMessages([]);
    }
  }, [activeChatId, isAuthenticated]);

  // Load selected LLM provider from localStorage if available
  useEffect(() => {
    const savedProvider = localStorage.getItem('llm_provider');
    if (savedProvider) {
      setLlmProvider(savedProvider);
    }
  }, []);
  
  // Function to handle changing the LLM provider
  const handleProviderToggle = (provider) => {
    setLlmProvider(provider);
    localStorage.setItem('llm_provider', provider);
  };
  
  // Function to load chat history
  const loadChatHistory = async (chatId) => {
    setLoadingHistory(true);
    try {
      const response = await getChatMessages(chatId);
      
      if (response.messages && response.messages.length > 0) {
        // Convert the messages to the format expected by the component
        const formattedMessages = response.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.is_user ? 'user' : 'ai'
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };
  
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
      // If authenticated and has active chat, use askQuestionWithHistory
      // which will also save messages to the backend
      let response;
      if (isAuthenticated && activeChatId) {
        response = await askQuestionWithHistory(question, activeChatId, llmProvider);
      } else {
        // Otherwise use regular askQuestion (no history saving)
        response = await askQuestion(question, llmProvider);
      }
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        text: response.answer,
        sender: 'ai',
        provider: response.provider || llmProvider
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
      <LLMToggle currentProvider={llmProvider} onToggle={handleProviderToggle} />
      <div className="messages-container">
        {loadingHistory ? (
          <div className="loading-history">Loading conversation history...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            Ask a question about your course materials!
            <div className="empty-state-subtitle">
              I'm here to help you understand your teaching content.
              <div className="provider-note">
                Using {
                  llmProvider === 'gemini' 
                    ? 'Google Gemini' 
                    : llmProvider === 'openrouter' 
                        ? 'Quasar Alpha' 
                        : 'Ollama (local)'
                } for responses
              </div>
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
                    
                    {/* Add Text-to-Speech for AI messages */}
                    {message.sender === 'ai' && (
                      <TextToSpeech text={mainContent.replace(/\*\*|__|```[\s\S]*?```|`|\[|\]|\(|\)/g, '')} />
                    )}
                    
                    {/* Show provider label for AI messages */}
                    {message.sender === 'ai' && message.provider && (
                      <div className="provider-label">
                        {message.provider === 'gemini' 
                          ? 'Gemini' 
                          : message.provider === 'openrouter' 
                              ? 'Quasar Alpha' 
                              : 'Ollama'
                        }
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="message ai loading">
                <div className="message-bubble">
                  Thinking
                  <div className="provider-label">
                    {llmProvider === 'gemini' 
                      ? 'Gemini' 
                      : llmProvider === 'openrouter' 
                          ? 'Quasar Alpha' 
                          : 'Ollama'
                    }
                  </div>
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
          disabled={isLoading || loadingHistory}
          ref={inputRef}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" disabled={isLoading || loadingHistory || !question.trim()}>
          {isLoading ? 'Sending' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
