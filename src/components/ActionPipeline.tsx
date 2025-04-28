import React, { useState, useRef, useEffect } from 'react';
import { pipelineService, Pipeline } from '../services/pipelineService';

export enum EmailAction {
  TRANSFER_FROM_SPAM = 'Transfer from Spam to Inbox',
  CLICK_LINK = 'Click Link in Email',
  MARK_IMPORTANT = 'Mark as Important',
  REPLY_TO_EMAIL = 'Reply to Email',
  FORWARD_EMAIL = 'Forward Email',
  DELETE_EMAIL = 'Delete Email'
}

interface ActionNode {
  id: string;
  action: EmailAction | null;
}

const ActionPipeline: React.FC = () => {
  const [nodes, setNodes] = useState<ActionNode[]>([
    { id: '1', action: null }
  ]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineName, setPipelineName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nodeCounter = useRef(1);

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      setIsLoading(true);
      const loadedPipelines = await pipelineService.getPipelines();
      setPipelines(loadedPipelines);
    } catch (err) {
      setError('Failed to load pipelines');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const canAddNode = () => {
    return nodes.every(node => node.action !== null);
  };

  const addNode = () => {
    if (!canAddNode()) return;
    nodeCounter.current += 1;
    const newId = nodeCounter.current.toString();
    setNodes([...nodes, { id: newId, action: null }]);
  };

  const deleteNode = (id: string) => {
    if (nodes.length > 1) {
      const newNodes = nodes.filter(node => node.id !== id);
      const updatedNodes = newNodes.map((node, index) => ({
        ...node,
        id: (index + 1).toString()
      }));
      setNodes(updatedNodes);
      nodeCounter.current = updatedNodes.length;
    }
  };

  const updateNode = (id: string, updates: Partial<ActionNode>) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  };

  const resetPipeline = () => {
    setNodes([{ id: '1', action: null }]);
    setSelectedPipeline('');
    setPipelineName('');
    nodeCounter.current = 1;
  };

  const handlePipelineSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pipelineId = e.target.value;
    setSelectedPipeline(pipelineId);
    
    if (pipelineId) {
      const selectedPipeline = pipelines.find(p => p.id === pipelineId);
      if (selectedPipeline) {
        setNodes(selectedPipeline.nodes);
        setPipelineName(selectedPipeline.name);
        nodeCounter.current = selectedPipeline.nodes.length;
      }
    } else {
      resetPipeline();
    }
  };

  const handleSavePipeline = async () => {
    if (!pipelineName.trim()) {
      setError('Please enter a pipeline name');
      return;
    }

    if (!nodes.every(node => node.action !== null)) {
      setError('All nodes must have an action selected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const pipelineToSave = {
        name: pipelineName,
        nodes: nodes
      };

      await pipelineService.savePipeline(pipelineToSave);
      await loadPipelines();
      setError(null);
    } catch (err) {
      setError('Failed to save pipeline');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <div className="p-8 min-h-[800px] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Email Action Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={resetPipeline}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Reset Pipeline
          </button>
          <button 
            onClick={handleSavePipeline}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Pipeline'}
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Execute Pipeline
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pipeline Name
          </label>
          <input
            type="text"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            placeholder="Enter pipeline name"
            className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Existing Pipeline
          </label>
          <select
            value={selectedPipeline}
            onChange={handlePipelineSelect}
            className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="">Create New Pipeline</option>
            {pipelines.map(pipeline => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-visible">
        <div className="flex items-center space-x-4 pb-4 min-w-max">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className={`w-64 p-4 border-2 ${node.action ? 'border-green-500' : 'border-dashed border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800`}>
                    <div className="flex justify-between items-center">
                      <div className="relative w-full" ref={dropdownRef}>
                        <button
                          onClick={() => toggleDropdown(node.id)}
                          className={`w-full text-left px-3 py-2 ${node.action ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'} rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`}
                        >
                          {node.action || 'Select Action'}
                        </button>
                        {activeDropdown === node.id && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-[300px] overflow-y-auto">
                            {Object.values(EmailAction).map((action) => (
                              <button
                                key={action}
                                className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                onClick={() => {
                                  updateNode(node.id, { action });
                                  setActiveDropdown(null);
                                }}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {nodes.length > 1 && (
                        <button
                          onClick={() => deleteNode(node.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {index < nodes.length - 1 && (
                <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              )}
            </React.Fragment>
          ))}
          <button
            onClick={addNode}
            disabled={!canAddNode()}
            className={`w-12 h-12 flex items-center justify-center border-2 border-dashed rounded-lg ${
              canAddNode() 
                ? 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-gray-400 dark:hover:border-gray-500' 
                : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPipeline; 