import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import ContextFileSelector from './components/ContextFileSelector';
import FileUploaderArchived from './components/FileUploaderArchived';
import ChatInterface from './components/ChatInterface';
import Auth from './components/auth/Auth';
import Sidebar from './components/Sidebar/Sidebar';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import Settings from './components/Settings/Settings';

// Component to handle logo switching based on theme
const ThemedLogo = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <img 
      src={darkMode ? "/images/University-lincoln-darkmode.png" : "/images/University-lincoln-logo.png"}
      alt="University of Lincoln Logo" 
      className="university-logo" 
    />
  );
};

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showArchivedUploader, setShowArchivedUploader] = useState(false);
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  
  // UI states
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    // Debug log to verify component is mounting
    console.log("App component mounted");
    setIsLoaded(true);
    
    // Check if user is already logged in (token in localStorage)
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);
  
  // Handle selected context files
  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };
  
  // Update the list of uploaded files
  const handleFileUploaded = (filename) => {
    setUploadedFiles(prev => [...prev, filename]);
  };

  // Toggle archived uploader visibility
  const toggleArchivedUploader = () => {
    setShowArchivedUploader(!showArchivedUploader);
  };
  
  // Handle successful authentication
  const handleAuthSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveChatId(null);
  };
  
  // Handle chat selection
  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    // Hide settings when selecting a chat
    setShowSettings(false);
  };
  
  // Handle new chat creation
  const handleNewChat = (chat) => {
    setActiveChatId(chat.id);
    // Hide settings when creating a new chat
    setShowSettings(false);
  };
  
  // Toggle settings page visibility
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Render login page only when not authenticated
  const renderLoginPage = () => {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <ThemedLogo />
            <h1>Teaching Companion</h1>
            <p className="login-subtitle">Your AI-powered learning assistant</p>
          </div>
          
          <div className="login-card">
            <Auth onAuthSuccess={handleAuthSuccess} />
          </div>
        </div>
      </div>
    );
  };

  // Render main application when authenticated
  const renderMainApp = () => {
    return (
      <div className="main-app-container">
        <Sidebar 
          currentUser={currentUser}
          onLogout={handleLogout}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          activeChatId={activeChatId}
          onSettingsClick={toggleSettings}
        />
        
        <div className="main-content">
          <header className="App-header">
            <div className="logo-container">
              <ThemedLogo />
              <h1>Teaching Companion</h1>
            </div>
          </header>
          
          <main className="authenticated-layout">
            {showSettings ? (
              <Settings />
            ) : (
              <>
                <section className="chat-section">
                  <div className="chat-header">
                    <h2>Ask Questions About Your Course</h2>
                    {activeChatId && (
                      <div className="chat-session-info">
                        <span className="session-indicator">Saving messages to your account</span>
                      </div>
                    )}
                  </div>
                  
                  <ChatInterface 
                    activeChatId={activeChatId}
                    isAuthenticated={isAuthenticated}
                  />
                </section>
                
                <section className="context-section">
                  <div className="context-files-container">
                    <h2>Select Course Materials</h2>
                    
                    <ContextFileSelector onFilesSelected={handleFilesSelected} />
                    
                    <div className="archived-toggle">
                      <button onClick={toggleArchivedUploader}>
                        {showArchivedUploader ? 'Hide Upload Feature' : 'Show Legacy Upload Feature'}
                      </button>
                    </div>
                    
                    {showArchivedUploader && (
                      <div className="archived-uploader">
                        <h3>Upload Additional Materials (Legacy)</h3>
                        <FileUploaderArchived onFileUploaded={handleFileUploaded} />
                      </div>
                    )}
                    
                    {uploadedFiles.length > 0 && (
                      <div className="uploaded-files">
                        <h3>Uploaded Files:</h3>
                        <ul>
                          {uploadedFiles.map((file, index) => (
                            <li key={index}>{file}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div className="App">
        {isAuthenticated ? renderMainApp() : renderLoginPage()}
      </div>
    </ThemeProvider>
  );
}

export default App;
