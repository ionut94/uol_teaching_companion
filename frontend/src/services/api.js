const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Upload a file (PDF or LaTeX) to the backend
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Ask a question about the uploaded PDFs
 */
export const askQuestion = async (question) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get answer');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
};

/**
 * Get list of uploaded files
 */
export const getUploadedFiles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/files`);
    
    if (!response.ok) {
      throw new Error('Failed to get uploaded files');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};
