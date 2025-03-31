import React, { useState } from 'react';
import { registerUser } from '../../services/api';
import './AuthForms.css';

const Register = ({ onRegisterSuccess, switchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await registerUser({ 
        username, 
        email, 
        password,
        is_teacher: isTeacher
      });
      
      setIsLoading(false);
      
      if (onRegisterSuccess) {
        onRegisterSuccess(response.user);
      }
    } catch (error) {
      setIsLoading(false);
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Create Account</h2>
      <p className="auth-subtitle">Join Teaching Companion</p>
      
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
            placeholder="Choose a username"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
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
            placeholder="Create a password"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isTeacher"
            checked={isTeacher}
            onChange={(e) => setIsTeacher(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="isTeacher">I am a teacher</label>
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-switch">
        Already have an account? 
        <button 
          className="switch-button" 
          onClick={switchToLogin}
          disabled={isLoading}
        >
          Login here
        </button>
      </div>
    </div>
  );
};

export default Register;