import React, { useState, useEffect } from 'react';

interface PrivacyStepProps {
    profileData: any;
    updateProfileData: (data: any) => void;
}

const modes = [
    { value: 'off', label: 'Off' },
    { value: 'noise', label: 'Noise' },
    { value: 'mask', label: 'Mask' },
    { value: 'disabled', label: 'Disabled' },
];

const PrivacyStep: React.FC<PrivacyStepProps> = ({ profileData, updateProfileData }) => {
    const [showWebGLOptions, setShowWebGLOptions] = useState(profileData.webGL.mode !== 'off');

    useEffect(() => {
        setShowWebGLOptions(profileData.webGL.mode !== 'off');
    }, [profileData.webGL.mode]);

    const handleStorageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        updateProfileData({
            storage: {
                ...profileData.storage,
                [name]: checked,
            },
        });
    };

    const handleTimezoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        updateProfileData({
            timezone: {
                ...profileData.timezone,
                [name]: checked,
            },
        });
    };

    const handleModeChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
        category: 'audioContext' | 'canvas' | 'webRTC' | 'webGL' | 'clientRects'
    ) => {
        const { value } = e.target;
        updateProfileData({
            [category]: {
                ...profileData[category],
                mode: value,
            },
        });
    };

    const handleMediaDevicesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked, value } = e.target;
        const numValue = name !== 'enableMasking' ? parseInt(value) || 0 : undefined;

        updateProfileData({
            mediaDevices: {
                ...profileData.mediaDevices,
                [name]: name === 'enableMasking' ? checked : numValue,
            },
        });
    };

    const handlePluginsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        updateProfileData({
            plugins: {
                ...profileData.plugins,
                [name]: checked,
            },
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Privacy Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure privacy and fingerprinting protection settings for your profile.
            </p>

            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Storage Settings
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="local"
                                name="local"
                                checked={profileData.storage.local}
                                onChange={handleStorageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="local"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Local Storage
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="extensions"
                                name="extensions"
                                checked={profileData.storage.extensions}
                                onChange={handleStorageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="extensions"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Extensions Storage
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="bookmarks"
                                name="bookmarks"
                                checked={profileData.storage.bookmarks}
                                onChange={handleStorageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="bookmarks"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Bookmarks
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="history"
                                name="history"
                                checked={profileData.storage.history}
                                onChange={handleStorageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="history"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Browsing History
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="passwords"
                                name="passwords"
                                checked={profileData.storage.passwords}
                                onChange={handleStorageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="passwords"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Passwords
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="session"
                                name="session"
                                checked={profileData.storage.session}
                                onChange={handleStorageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="session"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Session Storage
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="indexedDb"
                                name="indexedDb"
                                checked={profileData.storage.indexedDb}
                                onChange={handleStorageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="indexedDb"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                IndexedDB
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enableExternalExtensions"
                                name="enableExternalExtensions"
                                checked={profileData.storage.enableExternalExtensions}
                                onChange={handleStorageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="enableExternalExtensions"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                External Extensions
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Timezone Settings
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enabled"
                                name="enabled"
                                checked={profileData.timezone.enabled}
                                onChange={handleTimezoneChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="enabled"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Enable timezone manipulation
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="fillBasedOnIp"
                                name="fillBasedOnIp"
                                checked={profileData.timezone.fillBasedOnIp}
                                onChange={handleTimezoneChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="fillBasedOnIp"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Set timezone based on IP
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                            Audio Context
                        </h4>
                        <div>
                            <label
                                htmlFor="audioContext"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Audio Context Mode
                            </label>
                            <select
                                id="audioContext"
                                name="audioContext"
                                value={profileData.audioContext.mode}
                                onChange={(e) => handleModeChange(e, 'audioContext')}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            >
                                {modes.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                            Canvas
                        </h4>
                        <div>
                            <label
                                htmlFor="canvas"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Canvas Mode
                            </label>
                            <select
                                id="canvas"
                                name="canvas"
                                value={profileData.canvas.mode}
                                onChange={(e) => handleModeChange(e, 'canvas')}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            >
                                {modes.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                            WebRTC
                        </h4>
                        <div>
                            <label
                                htmlFor="webRTC"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                WebRTC Mode
                            </label>
                            <select
                                id="webRTC"
                                name="webRTC"
                                value={profileData.webRTC.mode}
                                onChange={(e) => handleModeChange(e, 'webRTC')}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            >
                                {modes.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                            WebGL
                        </h4>
                        <div>
                            <label
                                htmlFor="webGL"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                WebGL Mode
                            </label>
                            <select
                                id="webGL"
                                name="webGL"
                                value={profileData.webGL.mode}
                                onChange={(e) => handleModeChange(e, 'webGL')}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            >
                                {modes.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Media Devices
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enableMasking"
                                name="enableMasking"
                                checked={profileData.mediaDevices.enableMasking}
                                onChange={handleMediaDevicesChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="enableMasking"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Enable media devices masking
                            </label>
                        </div>

                        {showWebGLOptions && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label
                                        htmlFor="videoInputs"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Video Inputs
                                    </label>
                                    <input
                                        type="number"
                                        id="videoInputs"
                                        name="videoInputs"
                                        value={profileData.mediaDevices.videoInputs}
                                        onChange={handleMediaDevicesChange}
                                        min="0"
                                        max="10"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                            focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="audioInputs"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Audio Inputs
                                    </label>
                                    <input
                                        type="number"
                                        id="audioInputs"
                                        name="audioInputs"
                                        value={profileData.mediaDevices.audioInputs}
                                        onChange={handleMediaDevicesChange}
                                        min="0"
                                        max="10"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                            focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="audioOutputs"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Audio Outputs
                                    </label>
                                    <input
                                        type="number"
                                        id="audioOutputs"
                                        name="audioOutputs"
                                        value={profileData.mediaDevices.audioOutputs}
                                        onChange={handleMediaDevicesChange}
                                        min="0"
                                        max="10"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                            focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Plugins
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enableVulnerable"
                                name="enableVulnerable"
                                checked={profileData.plugins.enableVulnerable}
                                onChange={handlePluginsChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="enableVulnerable"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Enable vulnerable plugins emulation
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enableFlash"
                                name="enableFlash"
                                checked={profileData.plugins.enableFlash}
                                onChange={handlePluginsChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="enableFlash"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Enable Flash plugin emulation
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyStep;
