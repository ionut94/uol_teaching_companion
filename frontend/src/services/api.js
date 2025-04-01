const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get the auth token from localStorage
const getAuthToken = () => localStorage.getItem('auth_token');

// Helper function for authenticated API requests
const authenticatedRequest = async (url, method = 'GET', body = null) => {
  const token = getAuthToken();
  
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Authentication required');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP error ${response.status}`
      }));
      throw new Error(errorData.error || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in authenticated request to ${url}:`, error);
    throw error;
  }
};

/**
 * User registration
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

/**
 * User login
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    const data = await response.json();
    
    // Log token for debugging
    console.log('Login successful. Token received:', data.access_token ? 'Yes (token exists)' : 'No');
    
    // Store token in localStorage
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

/**
 * User logout
 */
export const logoutUser = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  return authenticatedRequest(`${API_BASE_URL}/auth/profile`);
};

/**
 * Get user chat histories
 */
export const getChatHistories = async () => {
  try {
    console.log('Fetching chat histories with token:', getAuthToken() ? 'Token exists' : 'No token');
    const response = await authenticatedRequest(`${API_BASE_URL}/auth/chat-history`);
    console.log('Chat histories response:', response);
    return response;
  } catch (error) {
    console.error('Error in getChatHistories:', error);
    throw error;
  }
};

/**
 * Create a new chat
 */
export const createChatHistory = async (title = 'Untitled Chat') => {
  return authenticatedRequest(
    `${API_BASE_URL}/auth/chat-history`,
    'POST',
    { title }
  );
};

/**
 * Get messages for a specific chat
 */
export const getChatMessages = async (chatId) => {
  return authenticatedRequest(`${API_BASE_URL}/auth/chat-history/${chatId}`);
};

/**
 * Add message to chat history
 */
export const addMessageToChat = async (chatId, content, isUser = true) => {
  return authenticatedRequest(
    `${API_BASE_URL}/auth/chat-history/${chatId}/message`,
    'POST',
    { content, is_user: isUser }
  );
};

/**
 * Update chat title
 */
export const updateChatTitle = async (chatId, title) => {
  return authenticatedRequest(
    `${API_BASE_URL}/auth/chat-history/${chatId}`,
    'PUT',
    { title }
  );
};

/**
 * Delete chat history
 */
export const deleteChatHistory = async (chatId) => {
  return authenticatedRequest(
    `${API_BASE_URL}/auth/chat-history/${chatId}`,
    'DELETE'
  );
};

/**
 * Ask a question about the uploaded PDFs (original function without chat history)
 */
export const askQuestion = async (question, llmProvider = 'ollama') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        question,
        llm_provider: llmProvider
      })
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

// Modify existing askQuestion to support saving to chat history
export const askQuestionWithHistory = async (question, chatId = null, llmProvider = 'ollama') => {
  try {
    console.log(`Asking question with history. ChatId: ${chatId}, Auth: ${getAuthToken() ? 'Yes' : 'No'}, Provider: ${llmProvider}`);
    
    // First, send the question to get an answer
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        question,
        llm_provider: llmProvider
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get answer');
    }
    
    const data = await response.json();
    
    // If chatId is provided and user is authenticated, save to chat history
    if (chatId && getAuthToken()) {
      try {
        console.log('Saving user question to chat history');
        // Save user's question
        const userMsgResponse = await addMessageToChat(chatId, question, true);
        console.log('User message saved:', userMsgResponse);
        
        console.log('Saving AI response to chat history');
        // Save AI's response
        const aiMsgResponse = await addMessageToChat(chatId, data.answer, false);
        console.log('AI message saved:', aiMsgResponse);
      } catch (error) {
        console.error('Error saving messages to chat history:', error);
        // Continue even if saving to history fails
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
};

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
