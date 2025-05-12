import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ProxyStepProps {
    profileData: any;
    updateProfileData: (data: any) => void;
}

interface Proxy {
    id: string;
    host: string;
    port: number;
    protocol: string;
    country?: string;
    isActive: boolean;
    mappedEmail?: string;
}

const proxyModes = [
    { value: 'none', label: 'No Proxy' },
    { value: 'http', label: 'HTTP' },
    { value: 'https', label: 'HTTPS' },
    { value: 'socks4', label: 'SOCKS4' },
    { value: 'socks5', label: 'SOCKS5' },
    { value: 'ssh', label: 'SSH' },
    { value: 'tor', label: 'Tor' },
    { value: 'auto', label: 'Auto' },
];

const regions = [
    'us',
    'uk',
    'de',
    'ca',
    'fr',
    'jp',
    'ru',
    'cn',
    'in',
    'br',
    'au',
    'es',
    'it',
    'nl',
    'se',
    'kr',
];

const ProxyStep: React.FC<ProxyStepProps> = ({ profileData, updateProfileData }) => {
    const [proxyMode, setProxyMode] = useState(profileData.proxy.mode);
    const [showProxyOptions, setShowProxyOptions] = useState(proxyMode !== 'none');
    const [availableProxies, setAvailableProxies] = useState<Proxy[]>([]);
    const [isLoadingProxies, setIsLoadingProxies] = useState(false);
    const [selectedProxy, setSelectedProxy] = useState<string>('');

    useEffect(() => {
        fetchProxies();
    }, []);

    useEffect(() => {
        setShowProxyOptions(proxyMode !== 'none');
    }, [proxyMode]);

    const fetchProxies = async () => {
        try {
            setIsLoadingProxies(true);
            const proxies = await window.api.getProxies();
            setAvailableProxies(proxies || []);
        } catch (error) {
            console.error('Error fetching proxies:', error);
            toast.error('Failed to load proxies');
        } finally {
            setIsLoadingProxies(false);
        }
    };

    const handleProxyModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = e.target.value;
        setProxyMode(mode);
        updateProfileData({
            proxy: {
                ...profileData.proxy,
                mode,
            },
        });
    };

    const handleProxyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateProfileData({
            proxy: {
                ...profileData.proxy,
                [name]: name === 'port' ? parseInt(value, 10) || 0 : value,
            },
        });
    };

    const handleSelectProxy = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const proxyId = e.target.value;
        setSelectedProxy(proxyId);

        if (proxyId) {
            const selectedProxy = availableProxies.find((proxy) => proxy.id === proxyId);
            if (selectedProxy) {
                // Map proxy type to GoLogin proxy mode
                let mode = selectedProxy.protocol;
                if (mode === 'http' || mode === 'https' || mode === 'socks4' || mode === 'socks5') {
                    // These modes are directly compatible
                } else {
                    // Default to http for unsupported protocols
                    mode = 'http';
                }

                updateProfileData({
                    proxy: {
                        ...profileData.proxy,
                        mode,
                        host: selectedProxy.host,
                        port: selectedProxy.port,
                        // Keep existing credentials, as they're not in the proxy record
                    },
                });

                toast.success('Proxy settings applied');
            }
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Proxy Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Configure proxy settings for your browser profile.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Select Existing Proxy
                </h4>
                <div className="flex items-center space-x-2">
                    <select
                        id="existingProxy"
                        value={selectedProxy}
                        onChange={handleSelectProxy}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        disabled={isLoadingProxies}
                    >
                        <option value="">-- Select a proxy --</option>
                        {availableProxies.map((proxy) => (
                            <option key={proxy.id} value={proxy.id}>
                                {proxy.protocol}: {proxy.host}:{proxy.port}{' '}
                                {proxy.country ? `(${proxy.country})` : ''}
                                {proxy.mappedEmail ? ` - Used by: ${proxy.mappedEmail}` : ''}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={fetchProxies}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        disabled={isLoadingProxies}
                    >
                        {isLoadingProxies ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Select an existing proxy from your database to auto-fill the settings below
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Manual Proxy Configuration
                </h4>

                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="mode"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Proxy Mode
                        </label>
                        <select
                            id="mode"
                            name="mode"
                            value={proxyMode}
                            onChange={handleProxyModeChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                            {proxyModes.map((mode) => (
                                <option key={mode.value} value={mode.value}>
                                    {mode.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {showProxyOptions && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="host"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Host
                                    </label>
                                    <input
                                        type="text"
                                        id="host"
                                        name="host"
                                        value={profileData.proxy.host}
                                        onChange={handleProxyChange}
                                        placeholder="proxy.example.com"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="port"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Port
                                    </label>
                                    <input
                                        type="number"
                                        id="port"
                                        name="port"
                                        value={profileData.proxy.port || ''}
                                        onChange={handleProxyChange}
                                        placeholder="8080"
                                        min="1"
                                        max="65535"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Username (optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={profileData.proxy.username}
                                        onChange={handleProxyChange}
                                        placeholder="proxyuser"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Password (optional)
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={profileData.proxy.password}
                                        onChange={handleProxyChange}
                                        placeholder="••••••••"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="customName"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Custom Proxy Name (optional)
                                </label>
                                <input
                                    type="text"
                                    id="customName"
                                    name="customName"
                                    value={profileData.proxy.customName}
                                    onChange={handleProxyChange}
                                    placeholder="My Home Proxy"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="changeIpUrl"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Change IP URL (optional)
                                </label>
                                <input
                                    type="text"
                                    id="changeIpUrl"
                                    name="changeIpUrl"
                                    value={profileData.proxy.changeIpUrl}
                                    onChange={handleProxyChange}
                                    placeholder="https://proxy.example.com/rotate-ip?key=abc123"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    URL to call to rotate your IP address (if supported by your
                                    proxy provider)
                                </p>
                            </div>

                            {proxyMode === 'auto' && (
                                <div>
                                    <label
                                        htmlFor="autoProxyRegion"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Auto Proxy Region
                                    </label>
                                    <select
                                        id="autoProxyRegion"
                                        name="autoProxyRegion"
                                        value={profileData.proxy.autoProxyRegion}
                                        onChange={handleProxyChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select a region</option>
                                        {regions.map((region) => (
                                            <option key={region} value={region}>
                                                {region.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {proxyMode === 'tor' && (
                                <div>
                                    <label
                                        htmlFor="torProxyRegion"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Tor Proxy Region
                                    </label>
                                    <select
                                        id="torProxyRegion"
                                        name="torProxyRegion"
                                        value={profileData.proxy.torProxyRegion}
                                        onChange={handleProxyChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select a region</option>
                                        {regions.map((region) => (
                                            <option key={region} value={region}>
                                                {region.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProxyStep;
