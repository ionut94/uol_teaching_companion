import React, { useState, useEffect } from 'react';
import './App.css';
import ContextFileSelector from './components/ContextFileSelector';
import FileUploaderArchived from './components/FileUploaderArchived';
import ChatInterface from './components/ChatInterface';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showArchivedUploader, setShowArchivedUploader] = useState(false);
  
  useEffect(() => {
    // Debug log to verify component is mounting
    console.log("App component mounted");
    setIsLoaded(true);
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Teaching Companion</h1>
        {isLoaded && <p className="loaded-indicator">✓ React app loaded successfully</p>}
      </header>
      
      <main>
        <section className="context-section">
          <h2>Select Course Materials</h2>
          <p>Choose which lecture files to use as context for your questions</p>
          
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
          
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h3>Selected Context Files:</h3>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
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
        </section>
        
        <section className="chat-section">
          <h2>Ask Questions About Your Course</h2>
          <ChatInterface />
        </section>
      </main>
    </div>
  );
}

export default App;
