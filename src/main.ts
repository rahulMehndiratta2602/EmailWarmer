import { app, BrowserWindow } from 'electron';
import * as http from 'http';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Disable security for development
if (process.env.NODE_ENV === 'development') {
  app.commandLine.appendSwitch('disable-web-security');
  app.commandLine.appendSwitch('allow-file-access-from-files');
  app.commandLine.appendSwitch('disable-site-isolation-trials');
  app.commandLine.appendSwitch('ignore-certificate-errors');
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Set up a simple HTTP proxy server for development to make main process network requests visible
let debugProxyServer: http.Server | null = null;
const setupNetworkDebuggingProxy = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  // Simple HTTP proxy server
  const PORT = 9876;
  debugProxyServer = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // Parse URL and prepare to forward
    const url = new URL(req.url || '', 'http://localhost:9876');
    const targetPath = url.pathname.replace('/api-proxy', '');
    const targetUrl = `http://localhost:3002${targetPath}${url.search}`;
    
    console.log(`[Debug Proxy] ${req.method} ${req.url} → ${targetUrl}`);
    
    // Forward the request to the actual backend
    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: req.headers as http.OutgoingHttpHeaders
      },
      (proxyRes) => {
        // Copy response headers
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        
        // Pipe the response data
        proxyRes.pipe(res);
        
        // Log response
        console.log(`[Debug Proxy] Response: ${proxyRes.statusCode} for ${targetUrl}`);
      }
    );
    
    // Forward request body if any
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
    
    // Handle errors
    proxyReq.on('error', (error) => {
      console.error(`[Debug Proxy] Error: ${error.message}`);
      res.writeHead(500);
      res.end(`Proxy error: ${error.message}`);
    });
  });
  
  debugProxyServer.listen(PORT, () => {
    console.log(`Network debug proxy running at http://localhost:${PORT}`);
  });
};

// Function to set up IPC for network debugging
const setupNetworkDebuggingIPC = (mainWindow: BrowserWindow) => {
  // Send info to renderer when the proxy is ready
  mainWindow.webContents.on('did-finish-load', () => {
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.send('network-debug-proxy-ready', {
        proxyUrl: 'http://localhost:9876/api-proxy'
      });
    }
  });
};

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: process.env.NODE_ENV !== 'development', // Only disable in development
      allowRunningInsecureContent: process.env.NODE_ENV === 'development',
    },
  });

  // Load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Set up network debugging
  if (process.env.NODE_ENV === 'development') {
    setupNetworkDebuggingIPC(mainWindow);
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Set up the network debugging proxy
  if (process.env.NODE_ENV === 'development') {
    setupNetworkDebuggingProxy();
  }
  
  createWindow();
});

// Clean up the proxy server when the app closes
app.on('will-quit', () => {
  if (debugProxyServer) {
    debugProxyServer.close();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
