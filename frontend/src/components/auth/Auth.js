import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './AuthForms.css';

const Auth = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  const switchToRegister = () => setIsLoginView(false);
  const switchToLogin = () => setIsLoginView(true);
  
  return (
    <div className="auth-container">
      {isLoginView ? (
        <Login 
          onLoginSuccess={onAuthSuccess} 
          switchToRegister={switchToRegister} 
        />
      ) : (
        <Register 
          onRegisterSuccess={onAuthSuccess} 
          switchToLogin={switchToLogin} 
        />
      )}
    </div>
  );
};

export default Auth;