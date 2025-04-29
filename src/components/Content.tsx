import React from 'react';
import EmailPasswordList from './EmailPasswordList';
import PipelineContainer from './PipelineContainer';
import DarkModeToggle from './ui/DarkModeToggle';

interface ContentProps {
  activePage: string;
  onFileSubmit: (file: File) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Content: React.FC<ContentProps> = ({ activePage, onFileSubmit, isDarkMode, onToggleTheme }) => {
  // Common header with dark mode toggle
  const renderHeader = () => (
    <div className="flex justify-end py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
    </div>
  );

  switch (activePage) {
    case 'home':
      return (
        <div className="flex flex-col h-full">
          {renderHeader()}
          <div className="p-8 space-y-8 overflow-auto flex-1">
            <div>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Email Accounts</h2>
              <EmailPasswordList isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      );
    case 'pipeline':
      return (
        <div className="flex flex-col h-full">
          {renderHeader()}
          <div className="flex-1 overflow-hidden">
            <PipelineContainer />
          </div>
        </div>
      );
    default:
      return (
        <div className="flex flex-col h-full">
          {renderHeader()}
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Page not found
          </div>
        </div>
      );
  }
};

export default Content; 