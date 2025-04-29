import React, { useState } from 'react';
import ActionPipeline from './ActionPipeline';
import PipelineManager from './PipelineManager';
import { Pipeline } from '../types/pipeline';

const PipelineContainer: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'editor' | 'manager'>('editor');
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  const handleSelectPipeline = (pipeline: Pipeline) => {
    // Store the selected pipeline and switch to the editor tab
    setSelectedPipeline(pipeline);
    setSelectedTab('editor');
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* Tabs */}
      <div className="flex space-x-2 px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedTab('editor')}
          className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
            selectedTab === 'editor'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800'
          }`}
        >
          Pipeline Editor
        </button>
        <button
          onClick={() => setSelectedTab('manager')}
          className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
            selectedTab === 'manager'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800'
          }`}
        >
          Pipeline Manager
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        {selectedTab === 'editor' ? (
          <ActionPipeline 
            initialPipeline={selectedPipeline}
            onSaveSuccess={() => {
              setSelectedPipeline(null);
              // Optionally switch to manager view after saving
              // setSelectedTab('manager');
            }}
          />
        ) : (
          <PipelineManager 
            onSelectPipeline={handleSelectPipeline} 
          />
        )}
      </div>
    </div>
  );
};

export default PipelineContainer; 