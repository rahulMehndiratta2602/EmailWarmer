import React, { useState, useEffect, useCallback } from 'react';
import {
    Copy,
    Play,
    RefreshCw,
    Square,
    Trash2,
    RotateCw,
    Edit,
    ArrowUp,
    ArrowDown,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CreateProfileModal from './CreateProfileModal';
import ConfirmationModal from './ConfirmationModal';
import GoLoginDirectService from '../services/goLoginDirectService';

interface GoLoginProfile {
    id: string;
    name: string;
    lastActivity: string;
    canBeRunning: boolean;
    proxy?: string; // Add proxy field
}

// Raw profile type from API
interface RawGoLoginProfile {
    id: string;
    name: string;
    canBeRunning: boolean;
    lastActivity?: string;
    browserType: string;
    os: string;
    proxy?: {
        host?: string;
        port?: number;
        protocol?: string;
        mode?: string;
    };
    [key: string]: unknown;
}

type SortField = 'name' | 'lastActivity';
type SortDirection = 'asc' | 'desc' | 'none';

const AutomationSession: React.FC = () => {
    const [profiles, setProfiles] = useState<GoLoginProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField | null>('lastActivity');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [totalProfiles, setTotalProfiles] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isDeleteAllConfirmModalOpen, setIsDeleteAllConfirmModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteMode, setDeleteMode] = useState<'single' | 'multiple' | 'all'>('single');
    const [profileToDelete, setProfileToDelete] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState('');
    // Add states for profile actions
    const [startingProfiles, setStartingProfiles] = useState<string[]>([]);
    const [stoppingProfiles, setStoppingProfiles] = useState<string[]>([]);

    const sortProfiles = (
        profiles: GoLoginProfile[],
        field: SortField | null,
        direction: SortDirection
    ): GoLoginProfile[] => {
        if (field === null || direction === 'none') {
            return [...profiles]; // Return unsorted profiles
        }

        return [...profiles].sort((a, b) => {
            if (field === 'name') {
                return direction === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (field === 'lastActivity') {
                // Handle "Never" case specially
                if (a.lastActivity === 'Never' && b.lastActivity !== 'Never')
                    return direction === 'asc' ? -1 : 1;
                if (a.lastActivity !== 'Never' && b.lastActivity === 'Never')
                    return direction === 'asc' ? 1 : -1;
                if (a.lastActivity === 'Never' && b.lastActivity === 'Never') return 0;

                // Compare dates
                const dateA = new Date(a.lastActivity);
                const dateB = new Date(b.lastActivity);
                return direction === 'asc'
                    ? dateA.getTime() - dateB.getTime()
                    : dateB.getTime() - dateA.getTime();
            }
            return 0;
        });
    };

    const handleSort = (field: SortField) => {
        // If clicking on a different column, start with ascending sort
        if (field !== sortField) {
            setSortField(field);
            setSortDirection('asc');
            return;
        }

        // Cycle through: asc -> desc -> none
        if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else if (sortDirection === 'desc') {
            setSortDirection('none');
            setSortField(null);
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const fetchProfiles = async () => {
        try {
            setIsRefreshing(true);
            setError(null);
            setSelectedIds([]); // Clear selections when refreshing
            setIsAllSelected(false);

            // Use the IPC bridge instead of direct fetch
            const data = await window.api.getGoLoginProfiles();

            // Transform the data to match our expected format
            const formattedProfiles = data.profiles.map((profile: RawGoLoginProfile) => {
                // Format proxy string if available
                let proxyString = 'None';
                if (profile.proxy && profile.proxy.mode && profile.proxy.mode !== 'none') {
                    const { mode, host, port } = profile.proxy;
                    if (host && port) {
                        proxyString = `${mode}:${host}:${port}`;
                    }
                }

                return {
                    id: profile.id,
                    name: profile.name,
                    lastActivity: profile.lastActivity
                        ? new Date(profile.lastActivity).toLocaleString()
                        : 'Never',
                    canBeRunning: profile.canBeRunning,
                    proxy: proxyString,
                };
            });

            // Only sort if a sort field is selected
            const sortedProfiles = sortField
                ? sortProfiles(formattedProfiles, sortField, sortDirection)
                : formattedProfiles;

            setProfiles(sortedProfiles);
            setTotalProfiles(data.allProfilesCount);
        } catch (err) {
            console.error('Error fetching profiles:', err);
            setError(err instanceof Error ? err.message : String(err));
            toast.error(
                `Failed to fetch profiles: ${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    // Re-sort profiles when sort parameters change
    useEffect(() => {
        if (profiles.length > 0) {
            setProfiles(sortProfiles(profiles, sortField, sortDirection));
        }
    }, [sortField, sortDirection]);

    // Toggle selection for a single profile
    const toggleProfileSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
            setIsAllSelected(false);
        } else {
            setSelectedIds([...selectedIds, id]);
            // Check if all are now selected
            if (selectedIds.length + 1 === profiles.length) {
                setIsAllSelected(true);
            }
        }
    };

    // Toggle select all profiles
    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
            setIsAllSelected(false);
        } else {
            setSelectedIds(profiles.map((profile) => profile.id));
            setIsAllSelected(true);
        }
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success('Profile ID copied to clipboard');
    };

    const handleRun = async (id: string) => {
        console.log('Running profile:', id);
        try {
            // Add to loading state
            setStartingProfiles((prev) => [...prev, id]);
            await GoLoginDirectService.startProfile(id, false);
            toast.success('Profile started successfully');
        } catch (error) {
            console.error('Error starting profile:', error);
            toast.error(
                `Failed to start profile: ${error instanceof Error ? error.message : String(error)}`
            );
        } finally {
            // Remove from loading state
            setStartingProfiles((prev) => prev.filter((profileId) => profileId !== id));
            // Refresh the profiles list to show updated status
            fetchProfiles();
        }
    };

    const handleStop = async (id: string) => {
        console.log('Stopping profile:', id);
        try {
            // Add to loading state
            setStoppingProfiles((prev) => [...prev, id]);
            await GoLoginDirectService.stopProfile(id);
            toast.success('Profile stopped successfully');
        } catch (error) {
            console.error('Error stopping profile:', error);
            toast.error(
                `Failed to stop profile: ${error instanceof Error ? error.message : String(error)}`
            );
        } finally {
            // Remove from loading state
            setStoppingProfiles((prev) => prev.filter((profileId) => profileId !== id));
            // Refresh the profiles list to show updated status
            fetchProfiles();
        }
    };

    const handleEdit = (id: string) => {
        setSelectedProfileId(id);
        setIsUpdateModalOpen(true);
    };

    // Show confirmation dialog for single delete
    const confirmDelete = (id: string) => {
        setProfileToDelete(id);
        setDeleteMode('single');
        setIsDeleteModalOpen(true);
    };

    // Show confirmation dialog for batch delete
    const confirmBatchDelete = () => {
        if (selectedIds.length === 0) {
            toast.error('No profiles selected');
            return;
        }
        setDeleteMode('multiple');
        setIsDeleteModalOpen(true);
    };

    // First confirmation for delete all
    const confirmDeleteAll = () => {
        if (profiles.length === 0) {
            toast.error('No profiles to delete');
            return;
        }
        setDeleteMode('all');
        setIsDeleteAllModalOpen(true);
    };

    // Second confirmation for delete all
    const confirmDeleteAllFinal = () => {
        setIsDeleteAllModalOpen(false);
        setIsDeleteAllConfirmModalOpen(true);
    };

    // Handle actual deletion based on mode
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            switch (deleteMode) {
                case 'single':
                    await deleteSingleProfile(profileToDelete);
                    break;
                case 'multiple':
                    await deleteMultipleProfiles(selectedIds);
                    break;
                case 'all':
                    await deleteAllProfiles();
                    break;
            }
        } catch (err) {
            console.error('Error deleting profiles:', err);
            toast.error(
                `Failed to delete profiles: ${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setIsDeleteAllModalOpen(false);
            setIsDeleteAllConfirmModalOpen(false);
        }
    };

    // Delete a single profile
    const deleteSingleProfile = async (id: string) => {
        try {
            const result = await window.api.deleteGoLoginProfile(id);

            if (result.success) {
                // Remove from local state
                setProfiles(profiles.filter((profile) => profile.id !== id));
                setTotalProfiles((prev) => prev - 1);
                setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
                toast.success('Profile deleted successfully');
            } else {
                throw new Error(result.message || 'Failed to delete profile');
            }
        } catch (err) {
            console.error(`Error deleting profile ${id}:`, err);
            toast.error(
                `Failed to delete profile: ${err instanceof Error ? err.message : String(err)}`
            );
        }
    };

    // Delete multiple profiles
    const deleteMultipleProfiles = async (ids: string[]) => {
        try {
            // Use the IPC bridge instead of direct API call
            const result = await window.api.batchDeleteGoLoginProfiles(ids);

            if (result.success) {
                // Remove from local state
                setProfiles(profiles.filter((profile) => !ids.includes(profile.id)));
                setTotalProfiles((prev) => prev - ids.length);
                setSelectedIds([]);
                setIsAllSelected(false);
                toast.success(`${ids.length} profiles deleted successfully`);
            } else {
                throw new Error(result.message || 'Failed to delete profiles');
            }
        } catch (err) {
            console.error('Error deleting multiple profiles:', err);
            toast.error(
                `Failed to delete profiles: ${err instanceof Error ? err.message : String(err)}`
            );
        }
    };

    // Delete all profiles
    const deleteAllProfiles = async () => {
        try {
            const allIds = profiles.map((profile) => profile.id);

            // Use the IPC bridge instead of direct API call
            const result = await window.api.batchDeleteGoLoginProfiles(allIds);

            if (result.success) {
                setProfiles([]);
                setTotalProfiles(0);
                setSelectedIds([]);
                setIsAllSelected(false);
                toast.success('All profiles deleted successfully');
            } else {
                throw new Error(result.message || 'Failed to delete all profiles');
            }
        } catch (err) {
            console.error('Error deleting all profiles:', err);
            toast.error(
                `Failed to delete all profiles: ${err instanceof Error ? err.message : String(err)}`
            );
        }
    };

    const handleCreateProfile = () => {
        setIsCreateModalOpen(true);
    };

    const handleProfileCreated = () => {
        fetchProfiles();
        toast.success('Profile created successfully');
    };

    const handleRefresh = () => {
        fetchProfiles();
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return null;

        if (sortDirection === 'asc') {
            return <ArrowUp className="inline w-4 h-4 ml-1" />;
        } else if (sortDirection === 'desc') {
            return <ArrowDown className="inline w-4 h-4 ml-1" />;
        }

        return null;
    };

    if (isLoading && !isRefreshing) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading profiles...</p>
            </div>
        );
    }

    if (error && profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-4 p-6">
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Connection Error</h3>
                    <div className="mb-4">{error}</div>
                    <div className="text-gray-700 text-sm mb-4">
                        <p>Possible solutions:</p>
                        <ul className="list-disc pl-5 text-left">
                            <li>Check if the backend server is running</li>
                            <li>Verify your internet connection</li>
                            <li>Ensure the backend has the correct GoLogin API token</li>
                        </ul>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    GoLogin Profiles
                </h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleRefresh}
                        className={`px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center space-x-1 ${
                            isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        disabled={isRefreshing}
                        title="Refresh"
                    >
                        {isRefreshing ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Refreshing...</span>
                            </>
                        ) : (
                            <>
                                <RotateCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleCreateProfile}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                        title="Create Profile"
                    >
                        <span>Create Profile</span>
                    </button>
                </div>
            </div>

            <CreateProfileModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProfileCreated={handleProfileCreated}
                mode="create"
            />

            <CreateProfileModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onProfileCreated={handleProfileCreated}
                mode="update"
                profileId={selectedProfileId}
            />

            {/* Single/Batch Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={deleteMode === 'single' ? 'Delete Profile' : 'Delete Selected Profiles'}
                confirmText={isDeleting ? 'Deleting...' : 'Delete'}
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            >
                <p>
                    {deleteMode === 'single'
                        ? 'Are you sure you want to delete this profile? This action cannot be undone.'
                        : `Are you sure you want to delete ${selectedIds.length} selected profiles? This action cannot be undone.`}
                </p>
            </ConfirmationModal>

            {/* Delete All First Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteAllModalOpen}
                onClose={() => setIsDeleteAllModalOpen(false)}
                onConfirm={confirmDeleteAllFinal}
                title="Delete All Profiles"
                confirmText="Yes, Delete All"
                cancelText="Cancel"
                variant="danger"
            >
                <p>
                    Are you sure you want to delete ALL {profiles.length} profiles? This action
                    cannot be undone.
                </p>
            </ConfirmationModal>

            {/* Delete All Second Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteAllConfirmModalOpen}
                onClose={() => setIsDeleteAllConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Final Confirmation"
                confirmText={isDeleting ? 'Deleting...' : 'Yes, I am sure'}
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            >
                <div className="space-y-2">
                    <div className="flex items-center text-red-600">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="font-bold">Double-check your decision</span>
                    </div>
                    <p>
                        You are about to permanently delete ALL {profiles.length} profiles. This is
                        irreversible and will remove all your GoLogin browser profiles.
                    </p>
                    <p className="font-semibold">Are you absolutely sure you want to proceed?</p>
                </div>
            </ConfirmationModal>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Automation Sessions</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className={`flex items-center ${
                            isRefreshing
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                        }`}
                        title="Refresh"
                        disabled={isRefreshing}
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <span className="text-gray-600">Total Profiles: {totalProfiles}</span>
                </div>
            </div>

            {profiles.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No profiles found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        Create your first profile to get started.
                    </p>
                    <button
                        onClick={handleCreateProfile}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Create Profile
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {/* Batch actions */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedIds.length} selected
                            </span>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={confirmBatchDelete}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center"
                                    title="Delete Selected"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    <span>Delete Selected</span>
                                </button>
                            )}
                        </div>
                        <button
                            onClick={confirmDeleteAll}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            title="Delete All"
                        >
                            Delete All
                        </button>
                    </div>

                    <div className={`${isRefreshing ? 'opacity-60' : ''}`}>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-3 text-left">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                checked={isAllSelected}
                                                onChange={toggleSelectAll}
                                                title={
                                                    isAllSelected ? 'Deselect All' : 'Select All'
                                                }
                                            />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            <span>Name</span>
                                            {renderSortIcon('name')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        onClick={() => handleSort('lastActivity')}
                                    >
                                        <div className="flex items-center">
                                            <span>Last Activity</span>
                                            {renderSortIcon('lastActivity')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Proxy
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {profiles.map((profile) => (
                                    <tr
                                        key={profile.id}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                            selectedIds.includes(profile.id)
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : ''
                                        }`}
                                    >
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                checked={selectedIds.includes(profile.id)}
                                                onChange={() => toggleProfileSelection(profile.id)}
                                                title={
                                                    selectedIds.includes(profile.id)
                                                        ? 'Deselect'
                                                        : 'Select'
                                                }
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                    {profile.id}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyId(profile.id)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    title="Copy ID"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                {profile.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {profile.lastActivity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {profile.proxy}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRun(profile.id)}
                                                    className={`${
                                                        startingProfiles.includes(profile.id)
                                                            ? 'text-green-500 animate-pulse'
                                                            : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                                                    }`}
                                                    title="Run Profile"
                                                    disabled={
                                                        startingProfiles.includes(profile.id) ||
                                                        stoppingProfiles.includes(profile.id)
                                                    }
                                                >
                                                    <Play size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleStop(profile.id)}
                                                    className={`${
                                                        stoppingProfiles.includes(profile.id)
                                                            ? 'text-red-500 animate-pulse'
                                                            : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                                                    }`}
                                                    title="Stop Profile"
                                                    disabled={
                                                        startingProfiles.includes(profile.id) ||
                                                        stoppingProfiles.includes(profile.id)
                                                    }
                                                >
                                                    <Square size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(profile.id)}
                                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                    title="Edit Profile"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(profile.id)}
                                                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                    title="Delete Profile"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutomationSession;
