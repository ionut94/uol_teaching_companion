import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ collapsed }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      className={`theme-toggle-button ${darkMode ? 'dark' : 'light'}`} 
      onClick={toggleTheme}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      {collapsed ? (
        darkMode ? <span role="img" aria-label="Light mode">🌞</span> : <span role="img" aria-label="Dark mode">🌙</span>
      ) : (
        darkMode ? 'Light Mode' : 'Dark Mode'
      )}
      {collapsed && <span className="visually-hidden">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
    </button>
  );
};

export default ThemeToggle;