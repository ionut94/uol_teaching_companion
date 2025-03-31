import React, { useState } from 'react';
import { loginUser } from '../../services/api';
import './AuthForms.css';

const Login = ({ onLoginSuccess, switchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ username, password });
      setIsLoading(false);
      
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
    } catch (error) {
      setIsLoading(false);
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login to Teaching Companion</h2>
      <p className="auth-subtitle">Continue your learning journey</p>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-switch">
        Don't have an account? 
        <button 
          className="switch-button" 
          onClick={switchToRegister}
          disabled={isLoading}
        >
          Register here
        </button>
      </div>
    </div>
  );
};

export default Login;