import React, { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';

interface EmailPassword {
  id: string;
  email: string;
  password: string;
  selected?: boolean;
}

interface EmailPasswordListProps {
  isDarkMode: boolean;
}

const EmailPasswordList: React.FC<EmailPasswordListProps> = ({ isDarkMode }) => {
  const [emailPasswords, setEmailPasswords] = useState<EmailPassword[]>([]);
  const [useProxy, setUseProxy] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const newEntries = lines
          .map(line => {
            const [email, password] = line.split(',').map(item => item.trim());
            if (email && password) {
              return {
                id: Math.random().toString(36).substr(2, 9),
                email,
                password
              };
            }
            return null;
          })
          .filter(Boolean) as EmailPassword[];
        
        if (newEntries.length > 0) {
          setEmailPasswords(prev => [...prev, ...newEntries]);
          // Clear the file input
          event.target.value = '';
        } else {
          alert('No valid email/password pairs found in the file. Please check the format.');
        }
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsText(file);
    }
  };

  const handleAddEntry = () => {
    if (newEmail && newPassword) {
      setEmailPasswords(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        email: newEmail,
        password: newPassword
      }]);
      setNewEmail('');
      setNewPassword('');
      setShowAddForm(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEmailPasswords(prev => prev.filter(entry => entry.id !== id));
  };

  const handleDownloadTemplate = () => {
    const template = `example1@email.com,password123
example2@email.com,password456
example3@email.com,password789`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email_password_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setEmailPasswords(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setEmailPasswords(prev => prev.map(item => 
      item.id === id ? { ...item, selected: checked } : item
    ));
    // Update selectAll state based on whether all items are selected
    setSelectAll(prev => {
      const allSelected = emailPasswords.every(item => 
        item.id === id ? checked : item.selected
      );
      return allSelected;
    });
  };

  const handleDeleteSelected = () => {
    setEmailPasswords(prev => prev.filter(item => !item.selected));
    setSelectAll(false);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Import Section */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Import Email/Password List</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Upload CSV/TXT File
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Choose File
              </button>
              <button
                onClick={handleDownloadTemplate}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useProxy"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useProxy" className="text-sm font-medium dark:text-gray-300">
              Use Proxy
            </label>
          </div>
        </div>
      </div>

      {/* Email/Password List Section */}
      <div className={`flex-1 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold dark:text-white">Email/Password List</h3>
          <div className="flex items-center gap-2">
            {emailPasswords.some(item => item.selected) && (
              <button
                onClick={handleDeleteSelected}
                className={`p-2 rounded flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className={`p-2 rounded flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <th className="w-10 p-3">
                  {emailPasswords.length > 0 && (
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`h-4 w-4 rounded ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-blue-500' 
                          : 'border-gray-300 text-blue-600'
                      }`}
                    />
                  )}
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase p-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase p-3">Password</th>
                <th className="w-10 p-3"></th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {emailPasswords.map((entry) => (
                <tr key={entry.id} className={`hover:${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={entry.selected || false}
                      onChange={(e) => handleSelectItem(entry.id, e.target.checked)}
                      className={`h-4 w-4 rounded ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-blue-500' 
                          : 'border-gray-300 text-blue-600'
                      }`}
                    />
                  </td>
                  <td className="p-3 text-sm dark:text-gray-300">{entry.email}</td>
                  <td className="p-3 text-sm dark:text-gray-300">••••••••</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {emailPasswords.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No entries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className={`p-6 rounded-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Add New Entry</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailPasswordList; 