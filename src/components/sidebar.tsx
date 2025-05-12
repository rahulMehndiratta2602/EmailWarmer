import React from 'react';
import { Home, ChevronLeft, ChevronRight, GitBranch, PlayCircle } from 'lucide-react';

interface SidebarProps {
    activePage: string;
    onPageChange: (page: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    activePage,
    onPageChange,
    isCollapsed,
    onToggleCollapse,
    isDarkMode,
}) => {
    return (
        <div
            className={`h-full transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            } border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                {!isCollapsed && (
                    <h1
                        className={`text-xl font-bold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}
                    >
                        Email Warmer
                    </h1>
                )}
                <button
                    onClick={onToggleCollapse}
                    className={`p-1.5 rounded-md ${
                        isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <div className="p-4 space-y-2">
                <button
                    onClick={() => onPageChange('home')}
                    className={`w-full flex items-center p-2 rounded-md transition-colors ${
                        isCollapsed ? 'justify-center' : 'space-x-2'
                    } ${
                        activePage === 'home'
                            ? isDarkMode
                                ? 'bg-gray-700 text-white'
                                : 'bg-blue-50 text-blue-700'
                            : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Home className="w-5 h-5" />
                    {!isCollapsed && <span>Home</span>}
                </button>

                <button
                    onClick={() => onPageChange('pipeline')}
                    className={`w-full flex items-center p-2 rounded-md transition-colors ${
                        isCollapsed ? 'justify-center' : 'space-x-2'
                    } ${
                        activePage === 'pipeline'
                            ? isDarkMode
                                ? 'bg-gray-700 text-white'
                                : 'bg-blue-50 text-blue-700'
                            : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <GitBranch className="w-5 h-5" />
                    {!isCollapsed && <span>Pipelines</span>}
                </button>

                <button
                    onClick={() => onPageChange('automation-session')}
                    className={`w-full flex items-center p-2 rounded-md transition-colors ${
                        isCollapsed ? 'justify-center' : 'space-x-2'
                    } ${
                        activePage === 'automation-session'
                            ? isDarkMode
                                ? 'bg-gray-700 text-white'
                                : 'bg-blue-50 text-blue-700'
                            : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <PlayCircle className="w-5 h-5" />
                    {!isCollapsed && <span>Automation Session</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
