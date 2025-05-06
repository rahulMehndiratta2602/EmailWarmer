import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Download, Edit, Save, RefreshCw, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Pagination from './Pagination';
import { emailAccountService } from '../services/emailAccountService';
import { proxyService } from '../services/proxyService';
import { EmailAccount } from '../types/emailAccount';
import { ProxyMappingResult } from '../types/proxy';
import ErrorNotification from './ErrorNotification';

interface EmailPasswordListProps {
  isDarkMode: boolean;
}

const EmailPasswordList: React.FC<EmailPasswordListProps> = ({ isDarkMode }) => {
  const [emailPasswords, setEmailPasswords] = useState<EmailAccount[]>([]);
  const [proxyMappings, setProxyMappings] = useState<ProxyMappingResult[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyConfirmText, setEmptyConfirmText] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState<{[key: string]: boolean}>({});

  // Calculate pagination values
  const totalPages = Math.ceil(emailPasswords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = emailPasswords.slice(startIndex, endIndex);

  // Format date to human-readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Format date as: MM/DD/YYYY HH:MM AM/PM
      return date.toLocaleDateString(undefined, { 
        month: '2-digit', 
        day: '2-digit',
        year: 'numeric'
      }) + ' ' + 
      date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Fetch email accounts from the database
  const fetchEmailAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const accounts = await emailAccountService.getEmailAccounts();
      console.log('Fetched accounts:', accounts);
      
      if (accounts && Array.isArray(accounts)) {
        setEmailPasswords(accounts.map((account: EmailAccount) => ({
          ...account,
          selected: false,
          isEditing: false
        })));
      } else {
        console.warn('Received non-array accounts data:', accounts);
        setEmailPasswords([]);
        setError('No accounts available. The server may not be running.');
      }
      
      // Fetch proxy mappings
      try {
        const mappings = await proxyService.getProxyMappings();
        if (mappings && Array.isArray(mappings)) {
          setProxyMappings(mappings);
        }
      } catch (err) {
        console.error('Error fetching proxy mappings:', err);
      }
    } catch (err) {
      console.error('Error fetching email accounts:', err);
      setError('Failed to load email accounts from database');
      setEmailPasswords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load accounts when component mounts
  useEffect(() => {
    fetchEmailAccounts();
  }, [fetchEmailAccounts]);

  // Get proxy info for an email account
  const getProxyInfo = (emailId: string) => {
    const mapping = proxyMappings.find(m => m.emailId === emailId);
    if (mapping) {
      return {
        host: mapping.proxyHost,
        port: mapping.proxyPort
      };
    }
    return null;
  };

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
                password,
                selected: false,
                isEditing: false
              };
            }
            return null;
          })
          .filter(Boolean) as EmailAccount[];
        
        if (newEntries.length > 0) {
          // For large batches, directly save to DB instead of setting state
          if (newEntries.length > 100) {
            importAccountsFromFile(newEntries);
          } else {
            setEmailPasswords(prev => [...prev, ...newEntries]);
          }
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

  // New function to handle importing large batches of accounts from file
  const importAccountsFromFile = async (accounts: EmailAccount[]) => {
    try {
      setIsLoading(true);
      setIsSaving(true);
      setError(null);
      
      // Create a copy of the accounts without UI state properties
      const cleanAccounts = accounts.map(account => ({
        id: account.id,
        email: account.email,
        password: account.password
      }));
      
      console.log(`Using optimized bulk import for ${cleanAccounts.length} accounts from file`);
      const result = await emailAccountService.bulkImportEmailAccounts(cleanAccounts);
      
      // Check if we got a valid result
      if (result && typeof result.count === 'number') {
        alert(`Successfully imported ${result.count} accounts from file`);
      } else {
        console.warn('Received unexpected result from bulkImportEmailAccounts:', result);
        alert('Accounts processed successfully');
      }
      
      // Refresh accounts from DB
      await fetchEmailAccounts();
    } catch (err) {
      console.error('Error bulk importing accounts from file:', err);
      setError('Failed to import accounts from file');
      // Show an alert to make the error more visible
      alert('Failed to import accounts from file. Check console for details.');
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const saveAccountsToDB = async () => {
    try {
      setIsSaving(true);
      setError(null);
      // Create a copy of the accounts without UI state properties
      const cleanAccounts = emailPasswords.map(account => ({
        id: account.id,
        email: account.email,
        password: account.password
      }));
      
      console.log('Saving accounts to DB:', cleanAccounts.length,cleanAccounts);
      const result = await emailAccountService.batchUpsertEmailAccounts(cleanAccounts);
      
      // Check if we got a valid result
      if (result && typeof result.count === 'number') {
        alert(`Successfully saved ${result.count} accounts to database`);
      } else {
        console.warn('Received unexpected result from batchUpsertEmailAccounts:', result);
        alert('Accounts processed successfully');
      }
      
      // Refresh accounts from DB
      await fetchEmailAccounts();
    } catch (err) {
      console.error('Error saving accounts to database:', err);
      setError('Failed to save accounts to database');
      // Show an alert to make the error more visible
      alert('Failed to save accounts to database. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEntry = async () => {
    if (newEmail && newPassword) {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Adding new account:', { email: newEmail, password: newPassword });
        const newAccount = await emailAccountService.createEmailAccount({
          email: newEmail,
          password: newPassword
        });
        
        console.log('New account created:', newAccount);
        
        // Refresh accounts list instead of just adding to state
        await fetchEmailAccounts();
        
        setNewEmail('');
        setNewPassword('');
        setShowAddForm(false);
      } catch (err) {
        console.error('Error adding email account:', err);
        setError('Failed to add email account to database');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    // Add confirmation
    if (!window.confirm('Are you sure you want to delete this email account?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await emailAccountService.deleteEmailAccount(id);
      
      if (success) {
        setEmailPasswords(prev => prev.filter(entry => entry.id !== id));
      } else {
        setError('Failed to delete email account');
      }
    } catch (err) {
      console.error('Error deleting email account:', err);
      setError('Failed to delete email account from database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAccount = (id: string) => {
    setEmailPasswords(prev => prev.map(entry => 
      entry.id === id ? { ...entry, isEditing: true } : entry
    ));
    
    const account = emailPasswords.find(entry => entry.id === id);
    if (account) {
      setEditEmail(account.email);
      setEditPassword(account.password);
    }
  };

  const handleSaveAccount = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const account = emailPasswords.find(entry => entry.id === id);
      if (!account) {
        setError('Account not found');
        setIsLoading(false);
        return;
      }
      
      // Update the account data
      const updatedAccount = await emailAccountService.updateEmailAccount(id, {
        email: editEmail,
        password: editPassword
      });
      
      if (updatedAccount) {
        setEmailPasswords(prev => prev.map(entry => 
          entry.id === id ? { ...updatedAccount, isEditing: false } : entry
        ));
      } else {
        setError('Failed to update account');
      }
      
      setEditEmail('');
      setEditPassword('');
    } catch (err) {
      console.error('Error updating account:', err);
      setError('Failed to update account in database');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectAll(false);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    setSelectAll(false);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setEmailPasswords(prev => prev.map((item, index) => ({
      ...item,
      selected: index >= startIndex && index < endIndex ? checked : item.selected
    })));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setEmailPasswords(prev => prev.map(item => 
      item.id === id ? { ...item, selected: checked } : item
    ));
    // Update selectAll state based on whether all items are selected
    setSelectAll(() => {
      const allSelected = emailPasswords.every(item => 
        item.id === id ? checked : item.selected
      );
      return allSelected;
    });
  };

  const handleDeleteSelected = async () => {
    const selectedCount = emailPasswords.filter(item => item.selected).length;
    
    if (selectedCount === 0) {
      setError('No accounts selected');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedCount} selected accounts?`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Filter accounts that are selected and ensure they have IDs
      const selectedIds = emailPasswords
        .filter(item => item.selected && item.id)
        .map(item => item.id as string);
      
      if (selectedIds.length === 0) {
        setError('No valid accounts selected for deletion');
        setIsLoading(false);
        return;
      }
      
      console.log('Deleting selected accounts with IDs:', selectedIds);
      
      // Log the API call for debugging
      try {
        const result = await emailAccountService.batchDeleteEmailAccounts(selectedIds);
        console.log('Batch delete result:', result);
        
        if (result && typeof result.count === 'number' && result.count > 0) {
          // Remove the deleted accounts from state
          setEmailPasswords(prev => prev.filter(item => !item.selected));
          setSelectAll(false);
          
          if (result.count !== selectedIds.length) {
            setError(`Deleted ${result.count} of ${selectedIds.length} accounts`);
          }
        } else {
          console.error('Invalid batch delete result:', result);
          setError('Failed to delete selected accounts - invalid server response');
        }
      } catch (apiError) {
        console.error('API error during batch delete:', apiError);
        setError(`API error: ${apiError.message || 'Unknown error during batch delete'}`);
      }
    } catch (err) {
      console.error('Error deleting selected accounts:', err);
      setError('Failed to delete selected accounts from database');
    } finally {
      setIsLoading(false);
    }
  };

  // Empty DB handler
  const handleEmptyDatabase = async () => {
    if (emptyConfirmText !== 'DELETE ALL EMAIL ACCOUNTS') {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all valid IDs from the email accounts
      const ids = emailPasswords
        .filter(account => account.id)
        .map(account => account.id as string);
      
      if (ids.length === 0) {
        setError('No accounts to delete');
        setIsLoading(false);
        setShowEmptyConfirm(false);
        return;
      }
      
      console.log('Emptying database, deleting accounts with IDs:', ids);
      
      // Log the API call for debugging
      try {
        const result = await emailAccountService.batchDeleteEmailAccounts(ids);
        console.log('Empty database result:', result);
        
        if (result && typeof result.count === 'number' && result.count > 0) {
          // Clear email accounts state
          setEmailPasswords([]);
          setSelectAll(false);
          
          if (result.count !== ids.length) {
            setError(`Deleted ${result.count} of ${ids.length} email accounts`);
          }
        } else {
          console.error('Invalid batch delete result for DELETE ALL:', result);
          setError('Failed to delete all accounts - invalid server response');
        }
      } catch (apiError) {
        console.error('API error during delete all:', apiError);
        setError(`API error: ${apiError.message || 'Unknown error during delete all'}`);
      }
      
      setShowEmptyConfirm(false);
      setEmptyConfirmText('');
    } catch (err) {
      console.error('Error emptying database:', err);
      setError('Failed to empty the database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Import Section */}
      <div className={`p-4 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Import Email/Password List</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Upload CSV/TXT File
            </label>
            <div className="flex gap-2 flex-wrap">
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
              <button
                onClick={saveAccountsToDB}
                disabled={isSaving || emailPasswords.length === 0}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-green-700 text-white hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500' 
                    : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400'
                }`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save to DB'}
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
        </div>
      </div>

      {/* Email/Password List Section */}
      <div className={`flex-1 mt-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} rounded-lg flex flex-col`}>
        <div className="p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold dark:text-white">Email/Password List</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Total: {emailPasswords.length} accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchEmailAccounts}
                disabled={isLoading}
                className={`p-2 rounded flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400'
                }`}
                title="Sync with Database"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {emailPasswords.some(item => item.selected) && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isLoading}
                  className={`p-2 rounded flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500' 
                      : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400'
                  } ring-2 ring-red-300 dark:ring-red-900`}
                  title="Delete Selected"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowAddForm(true)}
                disabled={isLoading}
                className={`p-2 rounded flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400'
                }`}
                title="Add New Email Account"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowEmptyConfirm(true)}
                disabled={isLoading || emailPasswords.length === 0}
                className={`p-2 rounded flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500' 
                    : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400'
                } ring-2 ring-red-300 dark:ring-red-900`}
                title="Delete All Email Accounts"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ErrorNotification 
            message={error}
            onDismiss={() => setError(null)}
            isDarkMode={isDarkMode}
          />

          {/* Table Container */}
          <div className="flex-1 max-h-[60vh] overflow-y-auto">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse table-fixed">
                <thead className="sticky top-0 z-10">
                  <tr className={`border-b ${
                    isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
                  }`}>
                    <th className="w-10 p-2 sm:p-3">
                      {currentItems.length > 0 && (
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className={`h-4 w-4 rounded ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-blue-500' 
                              : 'border-gray-300 text-blue-600'
                          }`}
                          disabled={isLoading}
                        />
                      )}
                    </th>
                    <th className="w-12 p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                    <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Password</th>
                    <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mapped Proxy</th>
                    <th className="w-48 p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Updated</th>
                    <th className="w-16 p-2 sm:p-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {isLoading && emailPasswords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No email accounts found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((entry, index) => {
                      const proxyInfo = getProxyInfo(entry.id || '');
                      return (
                        <tr key={entry.id} className={`hover:${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <td className="p-2 sm:p-3">
                            <input
                              type="checkbox"
                              checked={entry.selected || false}
                              onChange={(e) => handleSelectItem(entry.id, e.target.checked)}
                              className={`h-4 w-4 rounded ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-blue-500' 
                                  : 'border-gray-300 text-blue-600'
                              }`}
                              disabled={isLoading}
                            />
                          </td>
                          <td className="p-2 sm:p-3 text-sm dark:text-gray-300">{startIndex + index + 1}</td>
                          <td className="p-2 sm:p-3 text-sm dark:text-gray-300 truncate">
                            {entry.isEditing ? (
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className={`w-full px-2 py-1 text-sm rounded ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                autoFocus
                              />
                            ) : (
                              entry.email
                            )}
                          </td>
                          <td className="p-2 sm:p-3 text-sm dark:text-gray-300">
                            {entry.isEditing ? (
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <input
                                    type={passwordVisibility[entry.id] ? "text" : "password"}
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    className={`w-full px-2 py-1 text-sm rounded ${
                                      isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(entry.id)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2"
                                  >
                                    {passwordVisibility[entry.id] ? (
                                      <EyeOff className="w-3 h-3 text-gray-500" />
                                    ) : (
                                      <Eye className="w-3 h-3 text-gray-500" />
                                    )}
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleSaveAccount(entry.id)}
                                  disabled={isLoading || !editPassword || !editEmail}
                                  className={`p-1 rounded ${
                                    isDarkMode
                                      ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700 disabled:text-gray-500'
                                      : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-200 disabled:text-gray-400'
                                  }`}
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="flex-1">{'••••••••'}</span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(entry.id)}
                                  className="text-gray-500 hover:text-blue-500"
                                >
                                  {passwordVisibility[entry.id] ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-2 sm:p-3 text-sm dark:text-gray-300 truncate">
                            {proxyInfo ? (
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                {proxyInfo.host}:{proxyInfo.port}
                              </span>
                            ) : (
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>None</span>
                            )}
                          </td>
                          <td className="p-2 sm:p-3 text-sm dark:text-gray-300 truncate">
                            {formatDate(entry.updatedAt)}
                          </td>
                          <td className="p-2 sm:p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {!entry.isEditing && (
                                <button
                                  onClick={() => handleEditAccount(entry.id)}
                                  disabled={isLoading}
                                  className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 disabled:text-gray-400 dark:disabled:text-gray-600"
                                  title="Edit Account"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                disabled={isLoading}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 disabled:text-gray-400 dark:disabled:text-gray-600"
                                title="Delete Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {emailPasswords.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={emailPasswords.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className={`p-6 rounded-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Add New Email Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="name@example.com"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewEmail('');
                    setNewPassword('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  disabled={isLoading || !newEmail || !newPassword}
                  className={`px-4 py-2 text-sm font-medium text-white rounded ${
                    isLoading || !newEmail || !newPassword
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty Database Confirmation */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete All Email Accounts</h3>
            
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              This action cannot be undone. All email accounts will be permanently deleted.
            </p>
            
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              To confirm, type "DELETE ALL EMAIL ACCOUNTS" in the field below:
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                value={emptyConfirmText}
                onChange={(e) => setEmptyConfirmText(e.target.value)}
                placeholder="DELETE ALL EMAIL ACCOUNTS"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' 
                    : 'border-gray-300 focus:border-red-500'
                  } focus:outline-none focus:ring-1 focus:ring-red-500`}
                autoFocus
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEmptyConfirm(false);
                  setEmptyConfirmText('');
                }}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyDatabase}
                disabled={emptyConfirmText !== 'DELETE ALL EMAIL ACCOUNTS'}
                className={`px-4 py-2 rounded-md ${
                  emptyConfirmText !== 'DELETE ALL EMAIL ACCOUNTS'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Delete All Email Accounts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailPasswordList; 