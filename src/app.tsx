import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import Sidebar from './components/sidebar';
import Content from './components/Content';

const App = () => {
  const [activePage, setActivePage] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to dark mode if no theme is set
    return localStorage.getItem('theme') === 'light' ? false : true;
  });

  useEffect(() => {
    // Apply dark mode class on initial load
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark:bg-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark:bg-gray-900');
    }
    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleFileSubmit = async (file: File) => {
    try {
      const content = await file.text();
      console.log('File content:', content);
      alert('File successfully imported!');
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`flex h-screen overflow-y-auto transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <style>
        {`
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#1f2937' : '#f3f4f6'};
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? '#4b5563' : '#9ca3af'};
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? '#6b7280' : '#6b7280'};
          }
        `}
      </style>
      <div className="flex h-full">
        <div className="fixed h-full">
          <Sidebar 
            activePage={activePage} 
            onPageChange={setActivePage}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            isDarkMode={isDarkMode}
          />
        </div>
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Content 
            activePage={activePage} 
            onFileSubmit={handleFileSubmit}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        </div>
      </div>
    </div>
  );
};

function render() {
  const root = ReactDOM.createRoot(document.getElementById("root") || document.getElementById("app"));
  root.render(<App />);
}

render();
