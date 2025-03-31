import React, { useState } from 'react';
import { uploadFile } from '../services/api';

const FileUploader = ({ onFileUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus('');
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('Uploading...');
    
    try {
      const response = await uploadFile(selectedFile);
      setUploadStatus('File uploaded successfully!');
      setSelectedFile(null);
      
      // Notify parent component
      if (onFileUploaded) {
        onFileUploaded(response.filename);
      }
      
      // Reset the file input
      document.getElementById('fileInput').value = '';
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="file-uploader">
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

export default FileUploader;
