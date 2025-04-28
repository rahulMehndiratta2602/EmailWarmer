import { app, BrowserWindow, session, net, protocol } from 'electron';
import * as path from 'path';
import * as http from 'http';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Get API base URL based on environment
const getApiBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  } else {
    // In production, API should be on the same host
    // Will be defined at runtime by checking server availability
    return '';
  }
};

const API_BASE_URL = getApiBaseUrl();

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

// Function to get full API URL, handling both development and production
const getFullApiUrl = (endpoint: string): string => {
  // For development, use the localhost URL
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3001/api${endpoint}`;
  }
  
  // For production, try to use the same host as the app
  return `${getServerUrl()}/api${endpoint}`;
};

// Helper to determine server URL at runtime
let serverUrl: string | null = null;
const getServerUrl = (): string => {
  if (serverUrl) return serverUrl;
  
  // Default to localhost if no server URL has been determined yet
  return 'http://localhost:3001';
};

// Check server availability
const checkServerAvailability = async (): Promise<void> => {
  // In development, we always use localhost:3001
  if (process.env.NODE_ENV === 'development') {
    serverUrl = 'http://localhost:3001';
    return;
  }

  // In production, try to detect the correct server URL
  try {
    // First try localhost (in case backend is running locally)
    serverUrl = 'http://localhost:3001';
    // You could implement additional logic here to check if this server is available
    console.log('Using API server at:', serverUrl);
  } catch (error) {
    console.error('Failed to detect API server:', error);
    serverUrl = 'http://localhost:3001'; // Fallback to default
  }
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

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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
