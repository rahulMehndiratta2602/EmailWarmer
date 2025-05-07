import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trash2, RefreshCw, Globe, AlertTriangle } from 'lucide-react';
import Pagination from './Pagination';
import { proxyService } from '../services/proxyService';
import { Proxy } from '../types/proxy';
import ErrorNotification from './ErrorNotification';

interface ProxyListProps {
  isDarkMode: boolean;
}

const ProxyList: React.FC<ProxyListProps> = ({ isDarkMode }) => {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [fetchCountry, setFetchCountry] = useState('');
  const [fetchProtocol, setFetchProtocol] = useState('http');
  const [fetchLimit, setFetchLimit] = useState('10');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calculate pagination values
  const totalPages = Math.ceil(proxies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Apply sorting to the proxy list
  const sortedProxies = useMemo(() => {
    if (!sortField) return proxies;
    
    return [...proxies].sort((a, b) => {
      if (sortField === 'lastChecked') {
        const dateA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
        const dateB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [proxies, sortField, sortDirection]);

  // Get current items for display after sorting
  const currentItems = sortedProxies.slice(startIndex, endIndex);

  // Function to handle column sort
  const handleSort = (field: string) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

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

  // Fetch proxies from the database
  const fetchProxies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedProxies = await proxyService.getProxies();
      console.log('Raw proxy data:', fetchedProxies);
      
      // Debug: check if mapped email fields are present
      if (fetchedProxies && fetchedProxies.length > 0) {
        console.log('First proxy mapped email fields:', {
          mappedEmailId: fetchedProxies[0].mappedEmailId,
          mappedEmail: fetchedProxies[0].mappedEmail
        });
      }
      
      if (fetchedProxies && Array.isArray(fetchedProxies)) {
        setProxies(fetchedProxies.map((proxy: Proxy) => ({
          ...proxy,
          selected: false
        })));
      } else {
        console.warn('Received non-array proxies data:', fetchedProxies);
        setProxies([]);
        setError('No proxies available. The server may not be running.');
      }
    } catch (error) {
      console.error('Error fetching proxies:', error);
      setProxies([]);
      setError('Failed to fetch proxies. Check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load proxies when component mounts
  useEffect(() => {
    fetchProxies();
  }, [fetchProxies]);

  const handleDeleteProxy = async (id: string) => {
    // Add confirmation
    if (!window.confirm('Are you sure you want to delete this proxy?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await proxyService.deleteProxy(id);
      
      if (success) {
        setProxies(prev => prev.filter(entry => entry.id !== id));
      } else {
        setError('Failed to delete proxy');
      }
    } catch (err) {
      console.error('Error deleting proxy:', err);
      setError('Failed to delete proxy from database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    const selectedIds = proxies.filter(proxy => proxy.selected).map(proxy => proxy.id);
    
    if (selectedIds.length === 0) {
      setError('No proxies selected');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected proxies?`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Deleting selected proxies with IDs:', selectedIds);
      
      // Use batch delete instead of deleting one by one
      try {
        const result = await proxyService.batchDeleteProxies(selectedIds as string[]);
        console.log('Batch delete result:', result);
        
        if (result && typeof result.count === 'number' && result.count > 0) {
          setProxies(prev => prev.filter(entry => !entry.selected));
          setSelectAll(false);
          
          if (result.count !== selectedIds.length) {
            setError(`Deleted ${result.count} of ${selectedIds.length} proxies`);
          }
        } else {
          console.error('Invalid batch delete result:', result);
          setError('Failed to delete proxies - invalid server response');
        }
      } catch (apiError) {
        console.error('API error during batch delete:', apiError);
        setError(`API error: ${apiError.message || 'Unknown error during batch delete'}`);
      }
    } catch (err) {
      console.error('Error batch deleting proxies:', err);
      setError('Failed to delete proxies from database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllProxies = async () => {
    if (deleteAllConfirmText !== 'DELETE ALL PROXIES') {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all proxy IDs
      const proxyIds = proxies.map(proxy => proxy.id).filter(Boolean) as string[];
      
      if (proxyIds.length === 0) {
        setError('No proxies to delete');
        setIsLoading(false);
        setShowDeleteAllConfirm(false);
        setDeleteAllConfirmText('');
        return;
      }
      
      console.log('Emptying database, deleting proxies with IDs:', proxyIds);
      
      // Use batch delete instead of deleting one by one
      try {
        const result = await proxyService.batchDeleteProxies(proxyIds);
        console.log('Empty database result:', result);
        
        if (result && typeof result.count === 'number' && result.count > 0) {
          setProxies([]);
          setSelectAll(false);
          
          if (result.count !== proxyIds.length) {
            setError(`Deleted ${result.count} of ${proxyIds.length} proxies`);
          }
        } else {
          console.error('Invalid batch delete result for DELETE ALL:', result);
          setError('Failed to delete all proxies - invalid server response');
        }
      } catch (apiError) {
        console.error('API error during delete all:', apiError);
        setError(`API error: ${apiError.message || 'Unknown error during delete all'}`);
      }
      
      setShowDeleteAllConfirm(false);
      setDeleteAllConfirmText('');
    } catch (err) {
      console.error('Error deleting all proxies:', err);
      setError('Failed to delete all proxies from database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchProxies = async () => {
    // Validate inputs
    if (!fetchCountry || fetchCountry.length !== 2) {
      setError('Country code must be exactly 2 characters');
      return;
    }
    
    const limit = parseInt(fetchLimit);
    if (isNaN(limit) || limit < 1) {
      setError('Count must be a positive number');
      return;
    }
    
    try {
      setIsFetching(true);
      setError(null);
      
      // Call the proxy service to fetch proxies
      await proxyService.fetchProxies({
        country: fetchCountry.toLowerCase(),
        protocol: fetchProtocol,
        limit: limit
      });
      
      // Refresh proxy list
      await fetchProxies();
      
      // Close the modal
      setShowFetchModal(false);
      setFetchCountry('');
      setFetchLimit('10');
    } catch (err) {
      console.error('Error fetching proxies from provider:', err);
      setError('Failed to fetch proxies from provider');
    } finally {
      setIsFetching(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectAll(false); // Reset select all when changing pages
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
    setSelectAll(false); // Unselect all when changing page size
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    
    // Only select/deselect items on the current page
    setProxies(prev => prev.map((proxy, index) => {
      // Check if this item is on the current page
      const isOnCurrentPage = index >= startIndex && index < endIndex;
      
      return {
        ...proxy,
        // Only change selection if item is on current page
        selected: isOnCurrentPage ? checked : proxy.selected
      };
    }));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setProxies(prev => prev.map(proxy => 
      proxy.id === id 
        ? { ...proxy, selected: checked } 
        : proxy
    ));
    
    // Update selectAll based on whether all current page items are selected
    const currentPageItems = proxies.slice(startIndex, endIndex);
    const allCurrentPageSelected = currentPageItems.every(proxy => 
      proxy.id === id ? checked : proxy.selected
    );
    setSelectAll(allCurrentPageSelected);
  };

  // Get mapped email accounts for a proxy
  const getMappedEmails = (proxy: Proxy) => {
    // Check if proxy has a mapped email
    if (proxy.mappedEmail && proxy.mappedEmailId) {
      return [proxy.mappedEmail];
    }
    return [];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Proxy List Section */}
      <div className={`p-4 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold dark:text-white">Proxy List</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total: {proxies.length} proxies
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFetchModal(true)}
              className={`flex items-center px-3 py-2 text-sm rounded-md 
                ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              <Globe size={16} className="mr-1" />
              Fetch Proxies
            </button>
            <button
              onClick={fetchProxies}
              className={`p-2 rounded flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400'
              }`}
              disabled={isLoading}
              title="Refresh Proxies"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {proxies.filter(proxy => proxy.selected).length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className={`p-2 rounded flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500' 
                    : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400'
                }`}
                disabled={isLoading}
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              disabled={isLoading || proxies.length === 0}
              className={`p-2 rounded flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500' 
                  : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400'
              } ring-2 ring-red-300 dark:ring-red-900`}
              title="Delete All Proxies"
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
      
        {/* Proxy list table */}
        <div className="flex-1 max-h-[60vh] overflow-y-auto">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className={`border-b ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
                }`}>
                  <th className="w-10 p-2 sm:p-3">
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
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Host</th>
                  <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Port</th>
                  <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Country</th>
                  <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Protocol</th>
                  <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mapped Emails</th>
                  <th 
                    className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 select-none"
                    onClick={() => handleSort('lastChecked')}
                  >
                    Last Checked 
                    {sortField === 'lastChecked' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="w-16 p-2 sm:p-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {isLoading && proxies.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No proxies found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((proxy) => {
                    const mappedEmails = getMappedEmails(proxy);
                    return (
                      <tr key={proxy.id} className={`hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <td className="p-2 sm:p-3">
                          <input
                            type="checkbox"
                            checked={proxy.selected || false}
                            onChange={(e) => handleSelectItem(proxy.id || '', e.target.checked)}
                            className={`h-4 w-4 rounded ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-blue-500' 
                                : 'border-gray-300 text-blue-600'
                            }`}
                            disabled={isLoading}
                          />
                        </td>
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300">{proxy.host}</td>
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300">{proxy.port}</td>
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300">{proxy.country || 'Unknown'}</td>
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300">{proxy.protocol}</td>
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300">
                          {mappedEmails.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {mappedEmails.slice(0, 3).map((email, index) => (
                                <span key={index} className={`inline-flex px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                  {email}
                                </span>
                              ))}
                              {mappedEmails.length > 3 && (
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                  +{mappedEmails.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : proxy.mappedEmail ? (
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                              {proxy.mappedEmail}
                            </span>
                          ) : (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>None</span>
                          )}
                        </td>
                        <td className="p-2 sm:p-3 text-sm dark:text-gray-300">
                          {proxy.lastChecked ? formatDate(proxy.lastChecked) : 'Never'}
                        </td>
                        <td className="p-2 sm:p-3 text-center">
                          <button
                            onClick={() => handleDeleteProxy(proxy.id || '')}
                            disabled={isLoading}
                            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 disabled:text-gray-400 dark:disabled:text-gray-600"
                            title="Delete Proxy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
        {proxies.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={proxies.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </div>
      
      {/* Fetch Proxies Modal */}
      {showFetchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Fetch Proxies</h3>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Country (2 character code)
              </label>
              <input
                type="text"
                value={fetchCountry}
                onChange={(e) => setFetchCountry(e.target.value.slice(0, 2))}
                placeholder="e.g., us"
                maxLength={2}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Protocol
              </label>
              <select
                value={fetchProtocol}
                onChange={(e) => setFetchProtocol(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="http">HTTP/HTTPS</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Count
              </label>
              <input
                type="number"
                value={fetchLimit}
                onChange={(e) => setFetchLimit(e.target.value)}
                min="1"
                max="100"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFetchModal(false)}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleFetchProxies}
                disabled={isFetching || !fetchCountry || fetchCountry.length !== 2}
                className={`px-4 py-2 rounded-md ${
                  isFetching || !fetchCountry || fetchCountry.length !== 2
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isFetching ? 'Fetching...' : 'Fetch Proxies'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete All Proxies</h3>
            
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              This action cannot be undone. All proxies will be permanently deleted.
            </p>
            
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              To confirm, type "DELETE ALL PROXIES" in the field below:
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                value={deleteAllConfirmText}
                onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                placeholder="DELETE ALL PROXIES"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' 
                    : 'border-gray-300 focus:border-red-500'
                  } focus:outline-none focus:ring-1 focus:ring-red-500`}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteAllConfirm(false);
                  setDeleteAllConfirmText('');
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
                onClick={handleDeleteAllProxies}
                disabled={deleteAllConfirmText !== 'DELETE ALL PROXIES'}
                className={`px-4 py-2 rounded-md ${
                  deleteAllConfirmText !== 'DELETE ALL PROXIES'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Delete All Proxies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProxyList; 