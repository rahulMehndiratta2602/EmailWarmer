import React from 'react';
import * as Switch from '@radix-ui/react-switch';

interface ContentProps {
  activePage: string;
  onFileSubmit: (file: File) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Content: React.FC<ContentProps> = ({ activePage, onFileSubmit, isDarkMode, onToggleTheme }) => {
  switch (activePage) {
    case 'home':
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Welcome to Email Manager</h2>
          <p className="text-gray-600 dark:text-gray-300">Select a file to import your email/password list.</p>
        </div>
      );
    case 'settings':
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <label htmlFor="theme-toggle" className="text-gray-700 dark:text-gray-300">
                Dark Mode
              </label>
              <Switch.Root
                id="theme-toggle"
                checked={isDarkMode}
                onCheckedChange={onToggleTheme}
                className="w-[42px] h-[25px] bg-gray-200 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-default"
              >
                <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
              </Switch.Root>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default Content; 