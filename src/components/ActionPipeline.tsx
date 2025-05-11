import React, { useState, useRef, useEffect, useCallback } from 'react';
import { pipelineService } from '../services/pipelineService';
import { Pipeline } from '../types/pipeline';
import ConfirmationModal from './ui/ConfirmationModal';
import { RefreshCw } from 'lucide-react';

export enum EmailAction {
    TRANSFER_FROM_SPAM = 'Transfer from Spam to Inbox',
    CLICK_LINK = 'Click Link in Email',
    MARK_IMPORTANT = 'Mark as Important',
    REPLY_TO_EMAIL = 'Reply to Email',
    FORWARD_EMAIL = 'Forward Email',
    DELETE_EMAIL = 'Delete Email',
}

interface ActionNode {
    id: string;
    action: EmailAction | null;
    metadata?: Record<string, unknown>;
}

interface ActionPipelineProps {
    initialPipeline?: Pipeline | null;
    onSaveSuccess?: () => void;
}

const ActionPipeline: React.FC<ActionPipelineProps> = ({ initialPipeline, onSaveSuccess }) => {
    const [nodes, setNodes] = useState<ActionNode[]>([{ id: '1', action: null }]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [selectedPipeline, setSelectedPipeline] = useState<string>('');
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [availableActions, setAvailableActions] = useState<string[]>(Object.values(EmailAction));
    const [pipelineName, setPipelineName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [pipelineToDelete, setPipelineToDelete] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [editingMetadata, setEditingMetadata] = useState<string | null>(null);
    const [metadataKey, setMetadataKey] = useState<string>('');
    const [metadataValue, setMetadataValue] = useState<string>('');
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const nodeCounter = useRef(1);

    // Function to clear messages after a timeout
    const clearMessages = useCallback(() => {
        setTimeout(() => {
            setError(null);
            setSuccessMessage(null);
        }, 5000);
    }, []);

    useEffect(() => {
        loadPipelines();
        loadActions();

        // Check for dark mode preference
        const prefersDark =
            window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);

        // Listen for dark mode changes
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const darkModeHandler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        darkModeMediaQuery.addEventListener('change', darkModeHandler);

        return () => darkModeMediaQuery.removeEventListener('change', darkModeHandler);
    }, []);

    // Handle initial pipeline prop if provided
    useEffect(() => {
        if (initialPipeline) {
            setSelectedPipeline(initialPipeline.id);
            setNodes(initialPipeline.nodes);
            setPipelineName(initialPipeline.name);
            nodeCounter.current = initialPipeline.nodes.length;
        }
    }, [initialPipeline]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                activeDropdown &&
                dropdownRefs.current[activeDropdown] &&
                !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)
            ) {
                setActiveDropdown(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

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

    // Function to load actions from the database (mocked for now)
    const loadActions = async () => {
        try {
            // Get actions from the database via service
            const actions = await pipelineService.getAvailableActions();
            setAvailableActions(actions);
        } catch (err) {
            console.error('Failed to load actions:', err);
            // Fallback to enum values
            setAvailableActions(Object.values(EmailAction));
        }
    };

    const canAddNode = () => {
        return nodes.every((node) => node.action !== null);
    };

    const addNode = () => {
        if (!canAddNode()) return;
        nodeCounter.current += 1;
        const newId = nodeCounter.current.toString();
        setNodes([...nodes, { id: newId, action: null }]);
    };

    const deleteNode = (id: string) => {
        if (nodes.length > 1) {
            const newNodes = nodes.filter((node) => node.id !== id);
            const updatedNodes = newNodes.map((node, index) => ({
                ...node,
                id: (index + 1).toString(),
            }));
            setNodes(updatedNodes);
            nodeCounter.current = updatedNodes.length;
        }
    };

    const updateNode = (id: string, updates: Partial<ActionNode>) => {
        setNodes(nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)));
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
            const selectedPipeline = pipelines.find((p) => p.id === pipelineId);
            if (selectedPipeline) {
                // Ensure we load both actions and metadata for each node
                const loadedNodes = selectedPipeline.nodes.map((node) => ({
                    id: (node.id || Math.random().toString()).toString(),
                    action: node.action as EmailAction,
                    metadata: node.metadata || {},
                }));
                setNodes(loadedNodes);
                setPipelineName(selectedPipeline.name);
                nodeCounter.current = loadedNodes.length;
            }
        } else {
            resetPipeline();
        }
    };

    const handleDeletePipeline = () => {
        if (selectedPipeline) {
            setPipelineToDelete(selectedPipeline);
            setShowDeleteModal(true);
        }
    };

    const confirmDeletePipeline = async () => {
        if (!pipelineToDelete) return;

        try {
            setIsLoading(true);
            const success = await pipelineService.deletePipeline(pipelineToDelete);

            if (success) {
                setSuccessMessage('Pipeline deleted successfully');
                resetPipeline();
                await loadPipelines();

                // Call onSaveSuccess callback if provided (also used after delete)
                if (onSaveSuccess) {
                    onSaveSuccess();
                }
            } else {
                setError('Failed to delete pipeline');
            }
            clearMessages();
        } catch (err) {
            setError('Error deleting pipeline');
            console.error(err);
            clearMessages();
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
            setPipelineToDelete(null);
        }
    };

    const cancelDeletePipeline = () => {
        setShowDeleteModal(false);
        setPipelineToDelete(null);
    };

    const toggleDropdown = (id: string) => {
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    const saveNewPipeline = async () => {
        if (!pipelineName.trim()) {
            setError('Pipeline name is required');
            return;
        }

        // Validate nodes have actions
        if (!nodes.every((node) => node.action !== null)) {
            setError('All nodes must have an action selected');
            return;
        }

        try {
            setIsLoading(true);

            // Format nodes to match the backend API expectations - include metadata
            const formattedNodes = nodes.map((node) => ({
                action: String(node.action), // Convert EmailAction enum to string
                metadata: node.metadata || {}, // Include metadata in the node
            }));

            const newPipeline = {
                name: pipelineName,
                nodes: formattedNodes,
            };

            console.log('Saving new pipeline with data:', newPipeline);
            const savedPipeline = await pipelineService.savePipeline(newPipeline);
            console.log('Response from savePipeline:', savedPipeline);

            await loadPipelines();
            setSuccessMessage('Pipeline created successfully');
            clearMessages();

            // Call onSaveSuccess callback if provided
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error('Error saving pipeline:', err);
            setError('Failed to save pipeline');
            clearMessages();
        } finally {
            setIsLoading(false);
        }
    };

    const updatePipeline = async () => {
        if (!selectedPipeline) return;

        if (!pipelineName.trim()) {
            setError('Pipeline name is required');
            return;
        }

        // Validate nodes have actions
        if (!nodes.every((node) => node.action !== null)) {
            setError('All nodes must have an action selected');
            return;
        }

        try {
            setIsLoading(true);

            // Format nodes to match the backend API expectations - include metadata
            const formattedNodes = nodes.map((node) => ({
                action: String(node.action), // Convert EmailAction enum to string
                metadata: node.metadata || {}, // Include metadata in the node
            }));

            const updatedPipeline = {
                id: selectedPipeline,
                name: pipelineName,
                nodes: formattedNodes,
            };

            console.log('Updating pipeline with data:', updatedPipeline);
            const savedPipeline = await pipelineService.savePipeline(updatedPipeline);
            console.log('Response from savePipeline:', savedPipeline);

            await loadPipelines();
            setSuccessMessage('Pipeline updated successfully');
            clearMessages();

            // Call onSaveSuccess callback if provided
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error('Error updating pipeline:', err);
            setError('Failed to save pipeline');
            clearMessages();
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMetadata = (nodeId: string) => {
        if (!metadataKey.trim() || !metadataValue.trim()) {
            setError('Both key and value are required');
            return;
        }

        try {
            // Try to parse the value as JSON if it looks like an array or object
            let parsedValue = metadataValue;
            if (metadataValue.trim().startsWith('[') || metadataValue.trim().startsWith('{')) {
                parsedValue = JSON.parse(metadataValue);
            }

            setNodes(
                nodes.map((node) => {
                    if (node.id === nodeId) {
                        return {
                            ...node,
                            metadata: {
                                ...node.metadata,
                                [metadataKey]: parsedValue,
                            },
                        };
                    }
                    return node;
                })
            );

            setMetadataKey('');
            setMetadataValue('');
            setEditingMetadata(null);
        } catch (err) {
            setError('Invalid JSON value');
        }
    };

    const handleRemoveMetadata = (nodeId: string, key: string) => {
        setNodes(
            nodes.map((node) => {
                if (node.id === nodeId) {
                    const newMetadata = { ...node.metadata };
                    delete newMetadata[key];
                    return {
                        ...node,
                        metadata: newMetadata,
                    };
                }
                return node;
            })
        );
    };

    return (
        <div className="flex flex-col h-full w-full p-6 dark:bg-gray-800 overflow-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold dark:text-white">Email Action Pipeline</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={resetPipeline}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Reset Pipeline
                    </button>
                    <button
                        onClick={selectedPipeline ? updatePipeline : saveNewPipeline}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Pipeline'}
                    </button>
                    {selectedPipeline && (
                        <button
                            onClick={handleDeletePipeline}
                            disabled={isLoading || !selectedPipeline}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            Delete Pipeline
                        </button>
                    )}
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
                    <div className="flex justify-start gap-[200px] items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Existing Pipeline
                        </label>
                        <button
                            onClick={loadPipelines}
                            disabled={isLoading}
                            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
                            />
                            <span className="text-xs">Refresh</span>
                        </button>
                    </div>
                    <select
                        value={selectedPipeline}
                        onChange={handlePipelineSelect}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                        <option value="">Create New Pipeline</option>
                        {pipelines.map((pipeline) => (
                            <option key={pipeline.id} value={pipeline.id}>
                                {pipeline.name}
                            </option>
                        ))}
                    </select>
                </div>

                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

                {successMessage && (
                    <div className="text-green-500 text-sm mt-2">{successMessage}</div>
                )}
            </div>

            <div className="w-full flex-1 pb-6 relative">
                <div className="flex flex-wrap gap-6 min-h-[200px]">
                    {nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center mb-16">
                            <div className="flex flex-col">
                                <div className="relative z-0">
                                    <div
                                        className={`w-64 p-4 border-2 rounded-lg bg-white dark:bg-gray-800 ${
                                            node.action
                                                ? 'border-green-500'
                                                : 'border-dashed border-gray-300 dark:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div
                                                className="relative w-full"
                                                ref={(el) => (dropdownRefs.current[node.id] = el)}
                                            >
                                                <button
                                                    onClick={() => toggleDropdown(node.id)}
                                                    className={`w-full text-left px-3 py-2 ${
                                                        node.action
                                                            ? 'bg-green-50 dark:bg-green-900/20'
                                                            : 'bg-gray-100 dark:bg-gray-700'
                                                    } rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`}
                                                >
                                                    {node.action || 'Select Action'}
                                                </button>
                                                {activeDropdown === node.id && (
                                                    <div
                                                        className="fixed z-[100] w-64 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-[300px] overflow-y-auto"
                                                        style={{
                                                            top:
                                                                dropdownRefs.current[
                                                                    node.id
                                                                ]?.getBoundingClientRect().bottom +
                                                                'px',
                                                            left:
                                                                dropdownRefs.current[
                                                                    node.id
                                                                ]?.getBoundingClientRect().left +
                                                                'px',
                                                        }}
                                                    >
                                                        {availableActions.map((action) => (
                                                            <button
                                                                key={action}
                                                                className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateNode(node.id, {
                                                                        action: action as EmailAction,
                                                                    });
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

                                        {/* Metadata Section */}
                                        {node.action && (
                                            <div className="mt-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Metadata
                                                    </h4>
                                                    <button
                                                        onClick={() => setEditingMetadata(node.id)}
                                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                    >
                                                        Add Metadata
                                                    </button>
                                                </div>

                                                {/* Existing Metadata */}
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {node.metadata &&
                                                        Object.entries(node.metadata).map(
                                                            ([key, value]) => (
                                                                <div
                                                                    key={key}
                                                                    className="flex items-start justify-between text-sm mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                                                                >
                                                                    <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">
                                                                        {key}:
                                                                    </span>
                                                                    <div className="flex items-start flex-1 min-w-0">
                                                                        <span className="text-gray-700 dark:text-gray-300 break-all">
                                                                            {typeof value ===
                                                                            'object'
                                                                                ? JSON.stringify(
                                                                                      value
                                                                                  )
                                                                                : String(value)}
                                                                        </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleRemoveMetadata(
                                                                                    node.id,
                                                                                    key
                                                                                )
                                                                            }
                                                                            className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                </div>

                                                {/* Add Metadata Form */}
                                                {editingMetadata === node.id && (
                                                    <div className="mt-2 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={metadataKey}
                                                            onChange={(e) =>
                                                                setMetadataKey(e.target.value)
                                                            }
                                                            placeholder="Key"
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                        />
                                                        <textarea
                                                            value={metadataValue}
                                                            onChange={(e) =>
                                                                setMetadataValue(e.target.value)
                                                            }
                                                            placeholder="Value (JSON array/object or string)"
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 min-h-[60px] resize-y"
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingMetadata(null);
                                                                    setMetadataKey('');
                                                                    setMetadataValue('');
                                                                }}
                                                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleAddMetadata(node.id)
                                                                }
                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {index < nodes.length - 1 && (
                                <div className="mx-2 w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full hidden sm:block" />
                            )}
                        </div>
                    ))}
                    <div className="flex items-center mb-16">
                        <div className="flex flex-col">
                            <div className="relative z-0">
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
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                title="Delete Pipeline"
                message={`Are you sure you want to delete this pipeline? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDeletePipeline}
                onCancel={cancelDeletePipeline}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};

export default ActionPipeline;
