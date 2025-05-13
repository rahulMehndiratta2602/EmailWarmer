import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Pipeline } from '../types/pipeline';

interface PipelineSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pipelineId: string) => void;
}

const PipelineSelectionModal: React.FC<PipelineSelectionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPipelines();
        }
    }, [isOpen]);

    const fetchPipelines = async () => {
        try {
            setIsLoading(true);
            const pipelinesData = await window.api.getPipelines();
            setPipelines(pipelinesData);

            // Auto-select the first pipeline if available
            if (pipelinesData.length > 0 && !selectedPipelineId) {
                setSelectedPipelineId(pipelinesData[0].id);
            }
        } catch (error) {
            console.error('Error fetching pipelines:', error);
            toast.error('Failed to fetch pipelines');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePipelineSelect = (id: string) => {
        setSelectedPipelineId(id);
    };

    const handleConfirm = () => {
        if (!selectedPipelineId) {
            toast.error('Please select a pipeline');
            return;
        }
        onConfirm(selectedPipelineId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Select Automation Pipeline
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                        </div>
                    ) : pipelines.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-gray-600 dark:text-gray-400">No pipelines found</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                Please create a pipeline first.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Select a pipeline to run on the profiles:
                            </p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {pipelines.map((pipeline) => (
                                    <div
                                        key={pipeline.id}
                                        className={`p-3 border rounded cursor-pointer transition-colors ${
                                            selectedPipelineId === pipeline.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handlePipelineSelect(pipeline.id)}
                                    >
                                        <div className="font-medium">{pipeline.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {pipeline.nodes.length}{' '}
                                            {pipeline.nodes.length === 1 ? 'node' : 'nodes'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedPipelineId || pipelines.length === 0}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                            !selectedPipelineId || pipelines.length === 0
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }`}
                    >
                        Start Automation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PipelineSelectionModal;
