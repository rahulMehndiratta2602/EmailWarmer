import React, { useState, useEffect } from 'react';

// Define the necessary types inline instead of importing from problematic paths
interface GoLoginProfile {
    navigator?: {
        userAgent?: string;
        resolution?: string;
        language?: string;
        platform?: string;
    };
    webGLMetadata?: {
        mode?: string;
        vendor?: string;
        renderer?: string;
    };
    fonts?: {
        families?: string[];
        enableMasking?: boolean;
        enableDomRect?: boolean;
    };
}

interface BrowserStepProps {
    profileData: GoLoginProfile;
    updateProfileData: (data: Partial<GoLoginProfile>) => void;
}

const resolutions = [
    { value: '1920x1080', label: '1920x1080 (FHD)' },
    { value: '1366x768', label: '1366x768 (Laptop)' },
    { value: '1280x720', label: '1280x720 (720p)' },
    { value: '2560x1440', label: '2560x1440 (2K)' },
    { value: '3840x2160', label: '3840x2160 (4K)' },
    { value: '1024x768', label: '1024x768 (Old Standard)' },
    { value: '1536x864', label: '1536x864' },
    { value: '1440x900', label: '1440x900' },
    { value: '1680x1050', label: '1680x1050' },
    { value: '1280x800', label: '1280x800' },
];

const languages = [
    { value: 'en-US', label: 'English (United States)' },
    { value: 'en-GB', label: 'English (United Kingdom)' },
    { value: 'es-ES', label: 'Spanish (Spain)' },
    { value: 'fr-FR', label: 'French (France)' },
    { value: 'de-DE', label: 'German (Germany)' },
    { value: 'it-IT', label: 'Italian (Italy)' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' },
    { value: 'ru-RU', label: 'Russian (Russia)' },
    { value: 'ja-JP', label: 'Japanese (Japan)' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
    { value: 'zh-TW', label: 'Chinese (Traditional)' },
    { value: 'ko-KR', label: 'Korean (Korea)' },
    { value: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
    { value: 'hi-IN', label: 'Hindi (India)' },
];

const platforms = [
    { value: 'Win32', label: 'Windows' },
    { value: 'MacIntel', label: 'macOS' },
    { value: 'Linux x86_64', label: 'Linux' },
];

const webGLModes = [
    { value: 'mask', label: 'Mask' },
    { value: 'off', label: 'Off' },
    { value: 'noise', label: 'Noise' },
];

// Common user agents
const userAgents = [
    {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.36 Safari/537.36',
        label: 'Chrome - Windows',
    },
    {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.36 Safari/537.36',
        label: 'Chrome - macOS',
    },
    {
        value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.36 Safari/537.36',
        label: 'Chrome - Linux',
    },
    {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.36 Safari/537.36 Edg/134.0.2448.0',
        label: 'Edge - Windows',
    },
    {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
        label: 'Firefox - Windows',
    },
    {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        label: 'Safari - macOS',
    },
];

const BrowserStep: React.FC<BrowserStepProps> = ({ profileData, updateProfileData }) => {
    const [showWebGLMetadata, setShowWebGLMetadata] = useState(
        profileData.webGLMetadata?.mode !== 'off'
    );

    useEffect(() => {
        setShowWebGLMetadata(profileData.webGLMetadata?.mode !== 'off');
    }, [profileData.webGLMetadata?.mode]);

    const handleNavigatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateProfileData({
            navigator: {
                ...profileData.navigator,
                [name]: value,
            },
        });
    };

    const handleWebGLChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateProfileData({
            webGLMetadata: {
                ...profileData.webGLMetadata,
                [name]: value,
            },
        });
    };

    const handleFontsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';
        const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

        if (name === 'enableMasking' || name === 'enableDomRect') {
            updateProfileData({
                fonts: {
                    ...profileData.fonts,
                    [name]: checked,
                },
            });
        } else {
            updateProfileData({
                fonts: {
                    ...profileData.fonts,
                    [name]: value,
                },
            });
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Browser Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure how your browser will appear to websites, including user agent,
                resolution, and language.
            </p>

            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Navigator Settings
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="userAgent"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                User Agent
                            </label>
                            <select
                                id="userAgent"
                                name="userAgent"
                                value={profileData.navigator?.userAgent}
                                onChange={handleNavigatorChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            >
                                {userAgents.map((agent, index) => (
                                    <option key={index} value={agent.value}>
                                        {agent.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                The browser user agent string that will be sent to websites
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="resolution"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Screen Resolution
                            </label>
                            <select
                                id="resolution"
                                name="resolution"
                                value={profileData.navigator?.resolution}
                                onChange={handleNavigatorChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            >
                                {resolutions.map((resolution) => (
                                    <option key={resolution.value} value={resolution.value}>
                                        {resolution.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="language"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Language
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={profileData.navigator?.language}
                                    onChange={handleNavigatorChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                >
                                    {languages.map((language) => (
                                        <option key={language.value} value={language.value}>
                                            {language.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="platform"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Platform
                                </label>
                                <select
                                    id="platform"
                                    name="platform"
                                    value={profileData.navigator?.platform}
                                    onChange={handleNavigatorChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                >
                                    {platforms.map((platform) => (
                                        <option key={platform.value} value={platform.value}>
                                            {platform.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        WebGL Settings
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="mode"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                WebGL Mode
                            </label>
                            <select
                                id="mode"
                                name="mode"
                                value={profileData.webGLMetadata?.mode}
                                onChange={handleWebGLChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            >
                                {webGLModes.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Controls how WebGL fingerprinting is handled
                            </p>
                        </div>

                        {showWebGLMetadata && (
                            <>
                                <div>
                                    <label
                                        htmlFor="vendor"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        WebGL Vendor
                                    </label>
                                    <input
                                        type="text"
                                        id="vendor"
                                        name="vendor"
                                        value={profileData.webGLMetadata?.vendor}
                                        onChange={handleWebGLChange}
                                        placeholder="Google Inc. (AMD)"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="renderer"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        WebGL Renderer
                                    </label>
                                    <input
                                        type="text"
                                        id="renderer"
                                        name="renderer"
                                        value={profileData.webGLMetadata?.renderer}
                                        onChange={handleWebGLChange}
                                        placeholder="ANGLE (AMD, AMD Radeon(TM) R5 Graphics Direct3D11)"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Font Settings
                    </h4>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enableMasking"
                                name="enableMasking"
                                checked={profileData.fonts?.enableMasking}
                                onChange={handleFontsChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="enableMasking"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Enable fonts masking
                            </label>
                            <p className="ml-6 text-xs text-gray-500 dark:text-gray-400">
                                Helps prevent font fingerprinting
                            </p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enableDomRect"
                                name="enableDomRect"
                                checked={profileData.fonts?.enableDomRect}
                                onChange={handleFontsChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="enableDomRect"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Enable DOM rect masking
                            </label>
                            <p className="ml-6 text-xs text-gray-500 dark:text-gray-400">
                                Helps prevent canvas-based font fingerprinting
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrowserStep;
