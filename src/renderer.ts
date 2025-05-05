/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import './app';

// Declare the global window interface with our custom properties
declare global {
  interface Window {
    networkDebug: {
      getProxyUrl: () => string;
      fetchViaProxy: (url: string, options?: RequestInit) => Promise<Response>;
    };
  }
}

console.log('👋 This message is being logged by "renderer.js", included via webpack');

// Set up the network debugging proxy integration
if (process.env.NODE_ENV === 'development') {
  // Listen for proxy ready message
  const originalFetch = window.fetch;
  
  // Replace the global fetch with our version that routes through the proxy
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // If we have the networkDebug API exposed from preload
    if ('networkDebug' in window) {
      const { fetchViaProxy } = window.networkDebug;
      if (typeof fetchViaProxy === 'function') {
        // Convert input to URL string
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        
        // Only proxy backend API requests
        if (url && url.startsWith('http://localhost:3001')) {
          console.log(`[Fetch Interceptor] Routing request via proxy: ${url}`);
          return fetchViaProxy(url, init);
        }
      }
    }
    
    // Fall back to original fetch for non-backend requests
    return originalFetch(input, init);
  };
  
  console.log('[Network Debug] Fetch interceptor installed');
}
