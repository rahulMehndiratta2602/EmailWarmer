import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Download, Edit, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import Pagination from './Pagination';
import { emailAccountService } from '../services/emailAccountService';
import { EmailAccount } from '../types/emailAccount';

interface EmailPasswordListProps {
  isDarkMode: boolean;
}

const EmailPasswordList: React.FC<EmailPasswordListProps> = ({ isDarkMode }) => {
  const [emailPasswords, setEmailPasswords] = useState<EmailAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyConfirmText, setEmptyConfirmText] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleEditPassword = (id: string) => {
    setEmailPasswords(prev => prev.map(entry => 
      entry.id === id ? { ...entry, isEditing: true } : entry
    ));
    
    const account = emailPasswords.find(entry => entry.id === id);
    if (account) {
      setEditPassword(account.password);
    }
  };

  const handleSavePassword = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedAccount = await emailAccountService.updateEmailAccount(id, {
        password: editPassword
      });
      
      if (updatedAccount) {
        setEmailPasswords(prev => prev.map(entry => 
          entry.id === id ? { ...updatedAccount, isEditing: false } : entry
        ));
      } else {
        setError('Failed to update password');
      }
      
      setEditPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password in database');
    } finally {
      setIsLoading(false);
    }
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
      alert('No accounts selected for deletion');
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
      const result = await emailAccountService.batchDeleteEmailAccounts(selectedIds);
      
      console.log('Batch delete result:', result);
      
      if (result) {
        // Remove the deleted accounts from state
        setEmailPasswords(prev => prev.filter(item => !item.selected));
        setSelectAll(false);
        alert(`Successfully deleted ${selectedIds.length} accounts`);
        // Refresh the list from the database to ensure sync
        await fetchEmailAccounts();
      } else {
        setError('Failed to delete selected accounts');
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
    if (emptyConfirmText !== 'DELETE ALL') {
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
      const result = await emailAccountService.batchDeleteEmailAccounts(ids);
      
      console.log('Empty database result:', result);
      
      // Refresh accounts list
      await fetchEmailAccounts();
      setShowEmptyConfirm(false);
      setEmptyConfirmText('');
      alert('All email accounts have been deleted from the database');
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
                onClick={() => setShowEmptyConfirm(true)}
                disabled={isLoading || emailPasswords.length === 0}
                className={`p-2 rounded flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-red-700 text-white hover:bg-red-800 disabled:bg-gray-700 disabled:text-gray-500' 
                    : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400'
                }`}
                title="Empty Database"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
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
                  }`}
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
            </div>
          </div>

          {error && (
            <div className={`mb-4 p-3 rounded text-sm ${isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'}`}>
              {error}
            </div>
          )}

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
                    <th className="w-48 p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Updated</th>
                    <th className="w-16 p-2 sm:p-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {isLoading && emailPasswords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No email accounts found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((entry, index) => (
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
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300 truncate">{entry.email}</td>
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300">
                          {entry.isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="password"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                className={`w-full px-2 py-1 text-sm rounded ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePassword(entry.id)}
                                disabled={isLoading || !editPassword}
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
                            '••••••••'
                          )}
                        </td>
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300 truncate">
                          {formatDate(entry.updatedAt)}
                        </td>
                        <td className="p-2 sm:p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {!entry.isEditing && (
                              <button
                                onClick={() => handleEditPassword(entry.id)}
                                disabled={isLoading}
                                className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 disabled:text-gray-400 dark:disabled:text-gray-600"
                                title="Edit Password"
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
                    ))
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className={`p-6 rounded-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-2 text-red-500">Empty Database</h3>
            <p className="mb-4 text-sm dark:text-white">
              This action will permanently delete all {emailPasswords.length} email accounts from the database. 
              This cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Type "DELETE ALL" to confirm
              </label>
              <input
                type="text"
                value={emptyConfirmText}
                onChange={(e) => setEmptyConfirmText(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="DELETE ALL"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEmptyConfirm(false);
                  setEmptyConfirmText('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyDatabase}
                disabled={isLoading || emptyConfirmText !== 'DELETE ALL'}
                className={`px-4 py-2 text-sm font-medium text-white rounded ${
                  isLoading || emptyConfirmText !== 'DELETE ALL'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isLoading ? 'Deleting...' : 'Delete All Accounts'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailPasswordList; 