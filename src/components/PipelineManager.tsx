import React, { useState, useEffect, useCallback } from 'react';
import { Pipeline } from '../types/pipeline';
import { Trash, Edit, ChevronDown, ChevronRight, X } from 'lucide-react';
import { pipelineService } from '../services/pipelineService';

interface PipelineManagerProps {
  onSelectPipeline: (pipeline: Pipeline) => void;
}

const PipelineManager: React.FC<PipelineManagerProps> = ({ onSelectPipeline }) => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelines, setSelectedPipelines] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'name' | 'updatedAt' | 'nodes'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPipelines, setExpandedPipelines] = useState<string[]>([]);
  
  // Function to load pipelines from the service
  const loadPipelines = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('PipelineManager: Loading pipelines from service');
      const loadedPipelines = await pipelineService.getPipelines();
      console.log('PipelineManager: Received pipelines:', loadedPipelines);
      
      // Ensure all pipelines have updatedAt field
      const withUpdatedFields = loadedPipelines.map((pipeline: Pipeline) => ({
        ...pipeline,
        updatedAt: pipeline.updatedAt || pipeline.createdAt || new Date().toISOString(),
      }));
      
      setPipelines(withUpdatedFields);
    } catch (err) {
      console.error('Error loading pipelines:', err);
      setError('Failed to load pipelines');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load pipelines from service when component mounts
  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);
  
  // Also load from localStorage as fallback
  useEffect(() => {
    // If we already have pipelines from the service, don't load from localStorage
    if (pipelines.length > 0) return;
    
    try {
      const savedPipelines = localStorage.getItem('pipelines');
      if (savedPipelines) {
        const parsed = JSON.parse(savedPipelines);
        
        // Ensure all pipelines have updatedAt field
        const withUpdatedFields = parsed.map((pipeline: Pipeline) => ({
          ...pipeline,
          updatedAt: pipeline.updatedAt || pipeline.createdAt || new Date().toISOString(),
        }));
        
        setPipelines(withUpdatedFields);
      }
    } catch (err) {
      console.error('Error loading pipelines from localStorage:', err);
    }
  }, [pipelines.length]);

  // Save pipelines to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pipelines', JSON.stringify(pipelines));
  }, [pipelines]);

  const handleDeletePipeline = async (id: string) => {
    try {
      setIsLoading(true);
      await pipelineService.deletePipeline(id);
      setPipelines(pipelines.filter(p => p.id !== id));
      setSelectedPipelines(selectedPipelines.filter(pid => pid !== id));
      setExpandedPipelines(expandedPipelines.filter(pid => pid !== id));
    } catch (err) {
      console.error('Error deleting pipeline:', err);
      setError('Failed to delete pipeline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
      for (const id of selectedPipelines) {
        await pipelineService.deletePipeline(id);
      }
      setPipelines(pipelines.filter(p => !selectedPipelines.includes(p.id)));
      setSelectedPipelines([]);
      setSelectAll(false);
      setExpandedPipelines(expandedPipelines.filter(pid => !selectedPipelines.includes(pid)));
    } catch (err) {
      console.error('Error deleting selected pipelines:', err);
      setError('Failed to delete selected pipelines');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPipelines([]);
    } else {
      setSelectedPipelines(pipelines.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectPipeline = (id: string) => {
    if (selectedPipelines.includes(id)) {
      setSelectedPipelines(selectedPipelines.filter(pid => pid !== id));
      setSelectAll(false);
    } else {
      setSelectedPipelines([...selectedPipelines, id]);
      if (selectedPipelines.length + 1 === pipelines.length) {
        setSelectAll(true);
      }
    }
  };

  const toggleExpandPipeline = (id: string) => {
    if (expandedPipelines.includes(id)) {
      setExpandedPipelines(expandedPipelines.filter(pid => pid !== id));
    } else {
      setExpandedPipelines([...expandedPipelines, id]);
    }
  };

  const handleSort = (field: 'name' | 'updatedAt' | 'nodes') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPipelines = [...pipelines].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'updatedAt') {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === 'asc' 
        ? a.nodes.length - b.nodes.length 
        : b.nodes.length - a.nodes.length;
    }
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 h-full w-full bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pipeline Manager</h1>
        
        <button
          onClick={loadPipelines}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh Pipelines'}
        </button>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Bulk actions */}
      {selectedPipelines.length > 0 && (
        <div className="mb-4 flex items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
            {selectedPipelines.length} selected
          </span>
          <button
            onClick={handleDeleteSelected}
            className="px-3 py-1.5 bg-red-100 dark:bg-red-900 
                      text-red-700 dark:text-red-300 rounded hover:bg-red-200 
                      dark:hover:bg-red-800 focus:outline-none flex items-center"
          >
            <Trash size={16} className="mr-1" />
            Delete Selected
          </button>
        </div>
      )}
      
      {/* Pipeline table */}
      {isLoading && pipelines.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading pipelines...
        </div>
      ) : pipelines.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No pipelines found. Create a pipeline in the Pipeline Editor.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 
                              text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="w-10 px-2 py-3">
                  {/* Expand column */}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'name' && (
                      <ChevronDown className={`ml-1 w-4 h-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('nodes')}
                >
                  <div className="flex items-center">
                    Node Count
                    {sortField === 'nodes' && (
                      <ChevronDown className={`ml-1 w-4 h-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center">
                    Last Updated
                    {sortField === 'updatedAt' && (
                      <ChevronDown className={`ml-1 w-4 h-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedPipelines.map((pipeline) => (
                <React.Fragment key={pipeline.id}>
                  <tr 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedPipelines.includes(pipeline.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedPipelines.includes(pipeline.id)}
                        onChange={() => toggleSelectPipeline(pipeline.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 
                                  text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpandPipeline(pipeline.id)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                      >
                        {expandedPipelines.includes(pipeline.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {pipeline.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span>
                        {pipeline.nodes.length} {pipeline.nodes.length === 1 ? 'node' : 'nodes'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatDate(pipeline.updatedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-2">
                      <button
                        onClick={() => onSelectPipeline(pipeline)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded focus:outline-none bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                        title="Edit pipeline"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePipeline(pipeline.id)}
                        className="inline-flex items-center px-2.5 py-1.5 bg-red-100 dark:bg-red-900 
                                text-red-700 dark:text-red-300 rounded hover:bg-red-200 
                                dark:hover:bg-red-800 focus:outline-none"
                      >
                        <Trash size={16} className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedPipelines.includes(pipeline.id) && (
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <td></td>
                      <td></td>
                      <td colSpan={4} className="px-4 py-3">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <h4 className="font-medium mb-2">Pipeline Nodes:</h4>
                          <ol className="list-decimal list-inside pl-2 space-y-1.5">
                            {pipeline.nodes.length > 0 ? (
                              pipeline.nodes.map((node, index) => (
                                <li key={node.id} className="py-1 px-2 rounded bg-gray-100 dark:bg-gray-600">
                                  <span className="font-medium mr-2">Node {index + 1}:</span>
                                  {node.action || 'No action specified'}
                                </li>
                              ))
                            ) : (
                              <li className="italic text-gray-500 dark:text-gray-400">No nodes defined</li>
                            )}
                          </ol>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PipelineManager; 