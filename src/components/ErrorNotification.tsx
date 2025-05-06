import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ErrorNotificationProps {
  message: string | null;
  onDismiss: () => void;
  isDarkMode: boolean;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onDismiss, isDarkMode }) => {
  useEffect(() => {
    if (message) {
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);
  
  if (!message) return null;
  
  return (
    <div className={`
      mb-4 p-3 rounded-md text-sm relative 
      transition-opacity duration-200 ease-in-out
      ${isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'}
    `}>
      <button 
        onClick={onDismiss}
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-red-800 dark:hover:bg-red-700"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="pr-6">{message}</div>
    </div>
  );
};

export default ErrorNotification; 