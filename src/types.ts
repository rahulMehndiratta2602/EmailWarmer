export interface EmailAccount {
  id: string;
  email: string;
  password: string;
  proxyId: string;
  status: 'active' | 'inactive';
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proxy {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  protocol: 'http' | 'https' | 'socks5';
  status: 'active' | 'inactive';
  maxAccounts: number;
  currentAccounts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  accountId: string;
  type: 'move_from_spam' | 'mark_important' | 'click_link';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  lastRun: Date;
  nextRun: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  concurrentWindows: number;
  speed: number;
  autoStart: boolean;
  humanBehavior: {
    minDelay: number;
    maxDelay: number;
    mouseMovement: boolean;
    scrollBehavior: boolean;
    typingSpeedVariation: number;
  };
} 