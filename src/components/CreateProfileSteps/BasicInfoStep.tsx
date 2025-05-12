import React from 'react';

interface BasicInfoStepProps {
    profileData: any;
    updateProfileData: (data: any) => void;
}

const operatingSystems = [
    { value: 'win', label: 'Windows' },
    { value: 'lin', label: 'Linux' },
    { value: 'mac', label: 'macOS' },
];

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ profileData, updateProfileData }) => {
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        updateProfileData({ [name]: value });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Basic Profile Information
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Set the name and operating system for your GoLogin profile.
            </p>

            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Profile Name*
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        required
                        placeholder="My Profile"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Choose a descriptive name to identify your profile easily
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="os"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Operating System*
                    </label>
                    <select
                        id="os"
                        name="os"
                        value={profileData.os}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    >
                        {operatingSystems.map((os) => (
                            <option key={os.value} value={os.value}>
                                {os.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        The operating system your profile will emulate
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Notes
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={profileData.notes}
                        onChange={handleChange}
                        placeholder="Optional notes about this profile"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label
                        htmlFor="startUrl"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Start URL
                    </label>
                    <input
                        type="url"
                        id="startUrl"
                        name="startUrl"
                        value={profileData.startUrl}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        The URL to open when the profile is launched
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;
