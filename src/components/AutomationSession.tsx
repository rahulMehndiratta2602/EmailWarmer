import React, { useState, useEffect } from 'react';
import {
    Copy,
    Play,
    Square,
    Edit,
    Trash2,
    RefreshCw,
    ArrowUp,
    ArrowDown,
    Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CreateProfileModal from './CreateProfileModal';

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

interface GoLoginResponse {
    profiles: RawGoLoginProfile[];
    allProfilesCount: number;
}

// Declare the window APIs for TypeScript
declare global {
    interface Window {
        api: {
            // Add for GoLogin profiles
            getGoLoginProfiles: () => Promise<GoLoginResponse>;
            deleteGoLoginProfile: (id: string) => Promise<{ success: boolean; message: string }>;
        };
    }
}

type SortField = 'name' | 'lastActivity';
type SortDirection = 'asc' | 'desc' | 'none';

const AutomationSession: React.FC = () => {
    const [profiles, setProfiles] = useState<GoLoginProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalProfiles, setTotalProfiles] = useState(0);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('none');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success('Profile ID copied to clipboard');
    };

    const handleRun = (id: string) => {
        console.log('Run profile:', id);
        toast.error('Run functionality not implemented yet');
    };

    const handleStop = (id: string) => {
        console.log('Stop profile:', id);
        toast.error('Stop functionality not implemented yet');
    };

    const handleEdit = (id: string) => {
        console.log('Edit profile:', id);
        toast.error('Edit functionality not implemented yet');
    };

    const handleDelete = async (id: string) => {
        try {
            // Use the IPC bridge instead of direct fetch
            const result = await window.api.deleteGoLoginProfile(id);

            if (result.success) {
                // Remove from local state
                setProfiles(profiles.filter((profile) => profile.id !== id));
                setTotalProfiles((prev) => prev - 1);
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    GoLogin Profiles
                </h1>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchProfiles}
                        className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md flex items-center"
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </button>
                    <button
                        onClick={handleCreateProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
                    >
                        <Plus size={16} className="mr-2" />
                        Create Profile
                    </button>
                </div>
            </div>

            <CreateProfileModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProfileCreated={handleProfileCreated}
            />

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
                    <div className={`${isRefreshing ? 'opacity-60' : ''}`}>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
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
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                    {profile.id}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyId(profile.id)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    disabled={!profile.canBeRunning}
                                                    title="Run Profile"
                                                >
                                                    <Play size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleStop(profile.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Stop Profile"
                                                >
                                                    <Square size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(profile.id)}
                                                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                    title="Edit Profile"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(profile.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
