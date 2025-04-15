import React from 'react';
import { Home, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import { cn } from '../lib/utils';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, isCollapsed, onToggleCollapse, isDarkMode }) => {
  return (
    <div className={cn(
      "shadow-md transition-all duration-300 flex flex-col h-full",
      isDarkMode ? "bg-gray-800 border-r border-gray-700" : "bg-white border-r border-gray-200",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className={cn(
            "text-xl font-bold transition-opacity duration-300",
            isDarkMode ? "text-white" : "text-gray-800"
          )}>
            Email Manager
          </h1>
        )}
        <button
          onClick={onToggleCollapse}
          className={cn(
            "p-1.5 rounded-md focus:outline-none focus:ring-2 transition-colors",
            isDarkMode 
              ? "hover:bg-gray-700 focus:ring-gray-600 text-gray-300" 
              : "hover:bg-gray-100 focus:ring-gray-200 text-gray-600"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <Separator.Root className={cn(
        "h-px",
        isDarkMode ? "bg-gray-700" : "bg-gray-200"
      )} />

      {/* Navigation */}
      <NavigationMenu.Root className="p-4">
        <NavigationMenu.List className="space-y-1">
          <NavigationMenu.Item>
            <NavigationMenu.Link
              className={cn(
                "flex items-center p-2 rounded-md cursor-pointer transition-colors",
                isCollapsed ? "justify-center" : "space-x-2",
                activePage === 'home' 
                  ? isDarkMode 
                    ? "bg-gray-700 text-white" 
                    : "bg-blue-50 text-blue-700"
                  : isDarkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => onPageChange('home')}
            >
              <Home className={cn(
                "w-5 h-5",
                activePage === 'home' 
                  ? isDarkMode ? "text-white" : "text-blue-700"
                  : isDarkMode ? "text-gray-300" : "text-gray-600"
              )} />
              {!isCollapsed && (
                <span className="transition-all duration-300 ease-in-out opacity-100">
                  Home
                </span>
              )}
            </NavigationMenu.Link>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Link
              className={cn(
                "flex items-center p-2 rounded-md cursor-pointer transition-colors",
                isCollapsed ? "justify-center" : "space-x-2",
                activePage === 'settings' 
                  ? isDarkMode 
                    ? "bg-gray-700 text-white" 
                    : "bg-blue-50 text-blue-700"
                  : isDarkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => onPageChange('settings')}
            >
              <Settings className={cn(
                "w-5 h-5",
                activePage === 'settings' 
                  ? isDarkMode ? "text-white" : "text-blue-700"
                  : isDarkMode ? "text-gray-300" : "text-gray-600"
              )} />
              {!isCollapsed && (
                <span className="transition-all duration-300 ease-in-out opacity-100">
                  Settings
                </span>
              )}
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  );
};

export default Sidebar; 