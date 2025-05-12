import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BasicInfoStep from './CreateProfileSteps/BasicInfoStep';
import ProxyStep from './CreateProfileSteps/ProxyStep';
import BrowserStep from './CreateProfileSteps/BrowserStep';
import PrivacyStep from './CreateProfileSteps/PrivacyStep';
import ReviewStep from './CreateProfileSteps/ReviewStep';

interface CreateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProfileCreated: () => void;
}

// Default profile structure
const defaultProfile = {
    name: '',
    os: 'win',
    osSpec: '',
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
    chromeExtensions: [],
};

// Step titles
const steps = [
    'Basic Info',
    'Proxy Settings',
    'Browser Settings',
    'Privacy Settings',
    'Review & Create',
];

const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
    isOpen,
    onClose,
    onProfileCreated,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState(defaultProfile);

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

    const updateProfileData = (data: any) => {
        setProfileData((prev) => ({ ...prev, ...data }));
    };

    const handleCreateProfile = async () => {
        try {
            setIsLoading(true);
            const result = await window.api.createGoLoginProfile(profileData);

            toast.success('Profile created successfully!');
            setIsLoading(false);
            onProfileCreated();
            onClose();
        } catch (error) {
            console.error('Error creating profile:', error);
            toast.error(
                `Failed to create profile: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Create GoLogin Profile
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
                            onClick={handleCreateProfile}
                            disabled={isLoading}
                            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center ${
                                isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="mr-2">Creating...</span>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                </>
                            ) : (
                                'Create Profile'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateProfileModal;
