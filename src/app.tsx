import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import Sidebar from './components/sidebar';
import Content from './components/Content';
import { Toaster } from 'react-hot-toast';

// Add window interface for TypeScript
declare global {
    interface Window {
        zoomControl?: {
            zoomIn: () => number;
            zoomOut: () => number;
            resetZoom: () => number;
            getZoomFactor: () => number;
        };
    }
}

const App = () => {
    const [activePage, setActivePage] = useState('home');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Default to dark mode if no theme is set
        return localStorage.getItem('theme') === 'light' ? false : true;
    });
    const [zoomFactor, setZoomFactor] = useState(1);

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

    // Add keyboard event listeners for zoom functionality
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl (or Command on Mac) + keys
            if (event.ctrlKey || event.metaKey) {
                if (event.key === '+' || event.key === '=') {
                    event.preventDefault();
                    if (window.zoomControl) {
                        const newZoom = window.zoomControl.zoomIn();
                        setZoomFactor(newZoom);
                    }
                } else if (event.key === '-') {
                    event.preventDefault();
                    if (window.zoomControl) {
                        const newZoom = window.zoomControl.zoomOut();
                        setZoomFactor(newZoom);
                    }
                } else if (event.key === '0') {
                    event.preventDefault();
                    if (window.zoomControl) {
                        const newZoom = window.zoomControl.resetZoom();
                        setZoomFactor(newZoom);
                    }
                }
            }
        };

        // Add global event listener
        window.addEventListener('keydown', handleKeyDown);

        // Initialize zoom factor
        if (window.zoomControl) {
            setZoomFactor(window.zoomControl.getZoomFactor());
        }

        // Clean up event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div
            className={`flex h-screen overflow-y-auto transition-colors duration-200 ${
                isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
            }`}
        >
            <Toaster position="top-right" />
            {/* Zoom level indicator - only visible when not at 100% */}
            {zoomFactor !== 1 && (
                <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full z-50 opacity-70 hover:opacity-100 transition-opacity">
                    {Math.round(zoomFactor * 100)}%
                </div>
            )}
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
            <div className="flex h-full w-full">
                <div className="fixed h-full">
                    <Sidebar
                        activePage={activePage}
                        onPageChange={setActivePage}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={toggleSidebar}
                        isDarkMode={isDarkMode}
                    />
                </div>
                <div
                    className={`flex-1 transition-all duration-300 ${
                        isSidebarCollapsed ? 'ml-16' : 'ml-64'
                    }`}
                >
                    <Content
                        activePage={activePage}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                    />
                </div>
            </div>
        </div>
    );
};

function render() {
    const root = ReactDOM.createRoot(
        document.getElementById('root') || document.getElementById('app')
    );
    root.render(<App />);
}

render();
