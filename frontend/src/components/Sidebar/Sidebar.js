import React, { useState, useEffect } from 'react';
import { getChatHistories, createChatHistory, deleteChatHistory } from '../../services/api';
import './Sidebar.css';

function Sidebar({ currentUser, onLogout, onSelectChat, onNewChat, activeChatId }) {
  const [chatHistories, setChatHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChatHistories();
  }, []);

  const fetchChatHistories = async () => {
    try {
      setLoading(true);
      const histories = await getChatHistories();
      
      // Ensure that histories is an array
      if (Array.isArray(histories)) {
        setChatHistories(histories);
      } else if (histories && typeof histories === 'object') {
        // If it's an object with a data property that contains the array
        const historiesArray = histories.data || histories.chat_histories || [];
        setChatHistories(Array.isArray(historiesArray) ? historiesArray : []);
        console.log('Extracted chat histories array:', historiesArray);
      } else {
        console.error('Received unexpected data format for chat histories:', histories);
        setChatHistories([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Error fetching chat histories:', err);
      setChatHistories([]); // Ensure we always have an array
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const title = `New Chat ${new Date().toLocaleString()}`;
      const newChat = await createChatHistory(title);
      setChatHistories(prev => [newChat, ...prev]);
      if (onNewChat) onNewChat(newChat);
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Failed to create new chat');
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    
    try {
      await deleteChatHistory(chatId);
      setChatHistories(prev => prev.filter(chat => chat.id !== chatId));
      // If the active chat was deleted, reset it
      if (activeChatId === chatId && onSelectChat) {
        onSelectChat(null);
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat');
    }
  };

  const handleChatSelect = (chatId) => {
    if (onSelectChat) onSelectChat(chatId);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if date is yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show the date
    return date.toLocaleDateString();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.username) return '?';
    
    return currentUser.username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          <div className="user-details">
            <h3>{currentUser?.username || 'User'}</h3>
            <p>{currentUser?.email || ''}</p>
          </div>
          <button 
            className="toggle-sidebar-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
        
        <button className="new-chat-btn" onClick={handleNewChat}>
          {collapsed ? '+' : 'New Chat'}
          {collapsed && <span className="visually-hidden">New Chat</span>}
        </button>
      </div>

      <div className="sidebar-content">
        <div className="chats-container">
          {!collapsed && <h3>Chat History</h3>}
          
          {loading ? (
            <div className="loading-chats">Loading chats...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : chatHistories.length === 0 ? (
            <div className="empty-chats">No chats yet</div>
          ) : (
            <ul className="chat-list">
              {chatHistories.map(chat => (
                <li 
                  key={chat.id} 
                  className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="chat-icon">
                    💬
                  </div>
                  {!collapsed && (
                    <div className="chat-details">
                      <h4>{chat.title || 'Untitled Chat'}</h4>
                      <span className="chat-date">{formatDate(chat.created_at)}</span>
                    </div>
                  )}
                  {!collapsed && (
                    <button 
                      className="delete-chat-btn" 
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      aria-label="Delete chat"
                    >
                      🗑️
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          {collapsed ? '⤴️' : 'Log Out'}
          {collapsed && <span className="visually-hidden">Log Out</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;