import React, { useState } from 'react';
import { uploadFile } from '../services/api';
import './FileUploaderArchived.css';

const FileUploaderArchived = ({ onFileUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadStatus('');
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Error: Please select a file first');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const response = await uploadFile(selectedFile);
      setUploadStatus(`Success: File "${selectedFile.name}" uploaded successfully`);
      
      if (onFileUploaded) {
        onFileUploaded(selectedFile.name);
      }
      
      // Reset selected file
      setSelectedFile(null);
      
      // Reset the file input
      document.getElementById('fileInput').value = '';
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="file-uploader-archived">
      <p className="file-types-info">
        Accepted file types: PDF (.pdf), LaTeX (.tex)
      </p>
      <input 
        id="fileInput"
        type="file" 
        accept=".pdf,.tex" 
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      <button 
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>
      
      {uploadStatus && (
        <p className={uploadStatus.includes('Error') ? 'error' : 'success'}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default FileUploaderArchived;
