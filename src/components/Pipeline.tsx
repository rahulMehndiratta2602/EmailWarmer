import React from 'react';

interface PipelineProps {
  isDarkMode: boolean;
}

const Pipeline: React.FC<PipelineProps> = ({ isDarkMode }) => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Pipeline</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pipeline Steps */}
        <div className={`p-6 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Step 1: Data Collection</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Collect and process incoming data from various sources.
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Step 2: Processing</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Process and transform the collected data.
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">In Progress</span>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Step 3: Output</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Generate and deliver the final results.
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      {/* Pipeline Controls */}
      <div className="mt-8 flex space-x-4">
        <button className={`px-4 py-2 rounded-md ${
          isDarkMode 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}>
          Start Pipeline
        </button>
        <button className={`px-4 py-2 rounded-md ${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}>
          Pause
        </button>
        <button className={`px-4 py-2 rounded-md ${
          isDarkMode 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default Pipeline; 