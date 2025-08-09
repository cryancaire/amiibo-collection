import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      background: isDarkMode ? '#1f2937' : '#f9fafb',
      surface: isDarkMode ? '#1f2937' : '#ffffff',
      text: {
        primary: isDarkMode ? '#f9fafb' : '#1f2937',
        secondary: isDarkMode ? '#d1d5db' : '#6b7280'
      },
      border: isDarkMode ? '#4b5563' : '#e5e7eb'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};