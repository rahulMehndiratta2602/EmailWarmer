import React from 'react';

interface ReviewStepProps {
    profileData: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ profileData }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Review Profile Configuration
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Review your profile settings before creating. You can go back to previous steps to
                make changes if needed.
            </p>

            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Basic Information
                    </h4>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Profile Name:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.name}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Operating System:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.os === 'win'
                                    ? 'Windows'
                                    : profileData.os === 'lin'
                                    ? 'Linux'
                                    : 'macOS'}
                            </span>
                        </div>
                        {profileData.notes && (
                            <div className="grid grid-cols-3 gap-4">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Notes:
                                </span>
                                <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                    {profileData.notes}
                                </span>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Start URL:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.startUrl || 'Not set'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Proxy Settings
                    </h4>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Proxy Mode:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.proxy.mode}
                            </span>
                        </div>
                        {profileData.proxy.mode !== 'none' && (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Host:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                        {profileData.proxy.host}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Port:
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                        {profileData.proxy.port}
                                    </span>
                                </div>
                                {profileData.proxy.username && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Username:
                                        </span>
                                        <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                            {profileData.proxy.username}
                                        </span>
                                    </div>
                                )}
                                {profileData.proxy.password && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Password:
                                        </span>
                                        <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                            ******* (hidden)
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Browser Settings
                    </h4>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                User Agent:
                            </span>
                            <span
                                className="text-sm text-gray-900 dark:text-white col-span-2 truncate"
                                title={profileData.navigator.userAgent}
                            >
                                {profileData.navigator.userAgent}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Resolution:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.navigator.resolution}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Language:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.navigator.language}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                WebGL Mode:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.webGLMetadata.mode}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Privacy Settings
                    </h4>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                WebRTC Mode:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.webRTC.mode}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Canvas Mode:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.canvas.mode}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Timezone:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.timezone.enabled
                                    ? profileData.timezone.fillBasedOnIp
                                        ? 'Based on IP'
                                        : profileData.timezone.timezone || 'Custom'
                                    : 'Disabled'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Media Devices:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white col-span-2">
                                {profileData.mediaDevices.enableMasking
                                    ? `Masked (${profileData.mediaDevices.videoInputs} cameras, ${profileData.mediaDevices.audioInputs} microphones)`
                                    : 'Not masked'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-blue-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                Creating the profile may take a few moments. Please don't close the
                                window during this process.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;
