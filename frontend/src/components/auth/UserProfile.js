import React, { useState, useEffect } from 'react';
import { getUserProfile, getChatHistories, createChatHistory, deleteChatHistory, logoutUser } from '../../services/api';
import './UserProfile.css';

const UserProfile = ({ currentUser, onLogout, onSelectChat, onNewChat }) => {
  const [chatHistories, setChatHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);

  // Fetch chat histories when component mounts
  useEffect(() => {
    loadChatHistories();
  }, []);

  const loadChatHistories = async () => {
    try {
      setIsLoading(true);
      console.log('Loading chat histories for user:', currentUser?.username);
      const response = await getChatHistories();
      
      console.log('Chat histories loaded:', response);
      
      if (response && response.chat_histories) {
        setChatHistories(response.chat_histories);
      } else {
        console.warn('No chat histories found in response:', response);
        setChatHistories([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading chat histories:', error);
      setError('Failed to load chat histories');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    if (onLogout) {
      onLogout();
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    try {
      const title = newChatTitle.trim() || 'Untitled Chat';
      const response = await createChatHistory(title);
      setChatHistories([response.chat, ...chatHistories]);
      setNewChatTitle('');
      setShowNewChatForm(false);
      
      if (onNewChat) {
        onNewChat(response.chat);
      }
    } catch (error) {
      setError('Failed to create new chat');
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChatHistory(chatId);
        setChatHistories(chatHistories.filter(chat => chat.id !== chatId));
      } catch (error) {
        setError('Failed to delete chat');
      }
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>Hello, {currentUser.username}</h2>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      {currentUser.is_teacher && (
        <div className="teacher-badge">
          Teacher Account
        </div>
      )}
      
      <div className="chat-histories-section">
        <div className="section-header">
          <h3>Your Chat History</h3>
          <button 
            className="new-chat-button"
            onClick={() => setShowNewChatForm(!showNewChatForm)}
          >
            {showNewChatForm ? 'Cancel' : '+ New Chat'}
          </button>
        </div>
        
        {showNewChatForm && (
          <form className="new-chat-form" onSubmit={handleCreateChat}>
            <input
              type="text"
              placeholder="Enter chat title"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
            />
            <button type="submit">Create</button>
          </form>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        {isLoading ? (
          <div className="loading-indicator">Loading chat histories...</div>
        ) : (
          <div className="chat-list">
            {chatHistories.length === 0 ? (
              <div className="empty-chat-list">
                <p>You don't have any chats yet.</p>
                <button 
                  className="start-chat-button"
                  onClick={() => setShowNewChatForm(true)}
                >
                  Start your first chat
                </button>
              </div>
            ) : (
              chatHistories.map(chat => (
                <div key={chat.id} className="chat-item">
                  <div 
                    className="chat-info"
                    onClick={() => onSelectChat && onSelectChat(chat.id)}
                  >
                    <h4>{chat.title}</h4>
                    <p className="chat-date">
                      {new Date(chat.updated_at).toLocaleDateString()} • {chat.message_count} messages
                    </p>
                  </div>
                  <button 
                    className="delete-chat-button"
                    onClick={() => handleDeleteChat(chat.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;