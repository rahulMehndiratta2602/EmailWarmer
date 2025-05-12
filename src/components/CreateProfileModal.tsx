import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BasicInfoStep from './CreateProfileSteps/BasicInfoStep';
import ProxyStep from './CreateProfileSteps/ProxyStep';
import BrowserStep from './CreateProfileSteps/BrowserStep';
import PrivacyStep from './CreateProfileSteps/PrivacyStep';
import ReviewStep from './CreateProfileSteps/ReviewStep';
import { GoLoginProfile, GoLoginResponse } from '../types/window.d';

interface CreateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProfileCreated: () => void;
    mode?: 'create' | 'update';
    profileId?: string;
}

// Default profile structure
const defaultProfile = {
    name: '',
    os: 'win',
    osSpec: '',
    autoLang: false,
    proxy: {
        mode: 'none',
        host: '',
        port: 0,
        username: '',
        password: '',
        changeIpUrl: '',
        customName: '',
        autoProxyRegion: '',
        torProxyRegion: '',
    },
    navigator: {
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.36 Safari/537.36',
        resolution: '1280x720',
        language: 'en-US',
        platform: 'Win32',
    },
    fonts: {
        families: ['Arial', 'Calibri', 'Cambria'],
        enableMasking: true,
        enableDomRect: true,
    },
    webGLMetadata: {
        mode: 'off',
        vendor: 'Google Inc. (AMD)',
        renderer: 'ANGLE (AMD, AMD Radeon(TM) R5 Graphics Direct3D11)',
    },
    notes: '',
    startUrl: 'https://mail.google.com',
    googleServicesEnabled: false,
    lockEnabled: false,
    storage: {
        local: true,
        extensions: true,
        bookmarks: true,
        history: true,
        passwords: true,
        session: true,
        indexedDb: false,
        enableExternalExtensions: false,
    },
    plugins: {
        enableVulnerable: true,
        enableFlash: true,
    },
    timezone: {
        enabled: true,
        fillBasedOnIp: true,
        timezone: '',
    },
    audioContext: {
        mode: 'off',
    },
    canvas: {
        mode: 'off',
    },
    mediaDevices: {
        enableMasking: true,
        videoInputs: 0,
        audioInputs: 0,
        audioOutputs: 0,
    },
    webRTC: {
        mode: 'disabled',
    },
    webGL: {
        mode: 'off',
    },
    clientRects: {
        mode: 'noise',
    },
    chromeExtensions: [] as string[],
};

// Step titles
const steps = [
    'Basic Info',
    'Proxy Settings',
    'Browser Settings',
    'Privacy Settings',
    'Review & Create',
];

// Define a proper interface for the API
interface ExtendedAPI {
    getGoLoginProfiles: () => Promise<GoLoginResponse>;
    deleteGoLoginProfile: (id: string) => Promise<{ success: boolean; message: string }>;
    createGoLoginProfile: (profile: typeof defaultProfile) => Promise<GoLoginProfile>;
    getGoLoginProfileById: (id: string) => Promise<GoLoginProfile>;
    updateGoLoginProfile: (id: string, profile: typeof defaultProfile) => Promise<GoLoginProfile>;
}

const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
    isOpen,
    onClose,
    onProfileCreated,
    mode = 'create',
    profileId = '',
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileData, setProfileData] = useState(defaultProfile);
    const [error, setError] = useState<string | null>(null);

    // Reset form data when opened in create mode
    useEffect(() => {
        if (isOpen && mode === 'create') {
            setProfileData(defaultProfile);
            setCurrentStep(0);
        }
    }, [isOpen, mode]);

    // Fetch profile data if in update mode
    useEffect(() => {
        const fetchProfileData = async () => {
            if (mode === 'update' && profileId && isOpen) {
                try {
                    setIsLoadingProfile(true);
                    setError(null);
                    const api = window.api as ExtendedAPI;
                    const profile = await api.getGoLoginProfileById(profileId);

                    // Transform the profile data to match our form structure
                    // We need to ensure all required fields exist with proper defaults
                    const formattedProfile = {
                        ...defaultProfile,
                        ...profile,
                        // Ensure nested objects have all required fields
                        proxy: { ...defaultProfile.proxy, ...profile.proxy },
                        navigator: { ...defaultProfile.navigator, ...profile.navigator },
                        fonts: { ...defaultProfile.fonts, ...profile.fonts },
                        webGLMetadata: {
                            ...defaultProfile.webGLMetadata,
                            ...profile.webGLMetadata,
                        },
                        // Use type assertion for properties that might not be in the GoLoginProfile type
                        storage: { ...defaultProfile.storage, ...(profile as any).storage },
                        plugins: { ...defaultProfile.plugins, ...(profile as any).plugins },
                        timezone: { ...defaultProfile.timezone, ...profile.timezone },
                        audioContext: { ...defaultProfile.audioContext, ...profile.audioContext },
                        canvas: { ...defaultProfile.canvas, ...profile.canvas },
                        mediaDevices: { ...defaultProfile.mediaDevices, ...profile.mediaDevices },
                        webRTC: { ...defaultProfile.webRTC, ...profile.webRTC },
                        webGL: { ...defaultProfile.webGL, ...profile.webGL },
                        clientRects: { ...defaultProfile.clientRects, ...profile.clientRects },
                        chromeExtensions: profile.chromeExtensions || [],
                    };

                    setProfileData(formattedProfile);
                    setIsLoadingProfile(false);
                } catch (err) {
                    console.error('Error fetching profile:', err);
                    setError(err instanceof Error ? err.message : String(err));
                    toast.error(
                        `Failed to fetch profile: ${
                            err instanceof Error ? err.message : String(err)
                        }`
                    );
                    setIsLoadingProfile(false);
                }
            }
        };

        fetchProfileData();
    }, [isOpen, mode, profileId]);

    const handleNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateProfileData = (data: Partial<typeof profileData>) => {
        setProfileData((prev) => ({ ...prev, ...data }));
    };

    const handleSubmitProfile = async () => {
        try {
            setIsLoading(true);
            const api = window.api as ExtendedAPI;

            // Log the profile data before sending to API
            console.log('Profile data being sent:', profileData);
            console.log('Start URL value:', profileData.startUrl);

            if (mode === 'create') {
                await api.createGoLoginProfile(profileData);
                toast.success('Profile created successfully!');

                // Reset form data and step after successful creation
                setProfileData(defaultProfile);
                setCurrentStep(0);
            } else {
                await api.updateGoLoginProfile(profileId, profileData);
                toast.success('Profile updated successfully!');
            }

            setIsLoading(false);
            onProfileCreated();
            onClose();
        } catch (error) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} profile:`, error);
            toast.error(
                `Failed to ${mode === 'create' ? 'create' : 'update'} profile: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    if (isLoadingProfile) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                        <p className="text-gray-700 dark:text-gray-300">Loading profile data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-red-600 text-5xl">⚠️</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Error</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-center">{error}</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === 'create' ? 'Create' : 'Update'} GoLogin Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        currentStep >= index
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <span
                                    className={`mt-2 text-xs ${
                                        currentStep >= index
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {step}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className="hidden">
                                        {currentStep > index && (
                                            <div
                                                className="h-0.5 bg-blue-600"
                                                style={{ width: '100%' }}
                                            ></div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div
                    className="p-6 overflow-y-auto"
                    style={{
                        height: 'calc(90vh - 230px)',
                        minHeight: '300px',
                        maxHeight: 'calc(90vh - 230px)',
                    }}
                >
                    {currentStep === 0 && (
                        <BasicInfoStep
                            profileData={profileData}
                            updateProfileData={updateProfileData}
                        />
                    )}
                    {currentStep === 1 && (
                        <ProxyStep
                            profileData={profileData}
                            updateProfileData={updateProfileData}
                        />
                    )}
                    {currentStep === 2 && (
                        <BrowserStep
                            profileData={profileData}
                            updateProfileData={updateProfileData}
                        />
                    )}
                    {currentStep === 3 && (
                        <PrivacyStep
                            profileData={profileData}
                            updateProfileData={updateProfileData}
                        />
                    )}
                    {currentStep === 4 && <ReviewStep profileData={profileData} />}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <button
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                        className={`px-4 py-2 rounded-md ${
                            currentStep === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Previous
                    </button>
                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNextStep}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmitProfile}
                            disabled={isLoading}
                            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center ${
                                isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="mr-2">
                                        {mode === 'create' ? 'Creating' : 'Updating'}...
                                    </span>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                </>
                            ) : (
                                `${mode === 'create' ? 'Create' : 'Update'} Profile`
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateProfileModal;
