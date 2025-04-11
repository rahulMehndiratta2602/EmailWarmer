export interface EmailAccount {
  id: number
  email: string
  password: string
  provider: 'gmail' | 'outlook' | 'yahoo'
  proxyId?: number
  status: 'active' | 'inactive'
}

export interface Proxy {
  id: number
  host: string
  port: number
  username?: string
  password?: string
  protocol: 'http' | 'https' | 'socks5'
  useExtension: boolean
  status: 'active' | 'inactive'
  maxAccounts: number
  createdAt: string
  updatedAt: string
}

export interface ProxyStats {
  total: number
  active: number
  inactive: number
  errorRate: number
  successRate: number
  averageResponseTime: number
  lastRotation: string
}

export interface Task {
  id: number
  accountId: number
  type: TaskType
  status: TaskStatus
  progress: number
  lastRun?: string
  nextRun?: string
  humanBehavior?: HumanBehaviorParams
  schedule?: TaskSchedule
}

export interface TaskSchedule {
  startTime: string
  frequency: 'hourly' | 'daily' | 'weekly'
  interval: number
  priority?: number
}

export interface HumanBehaviorParams {
  minDelay: number
  maxDelay: number
  randomActions: boolean
  mouseMovement: boolean
  scrollBehavior: boolean
  mouseMovementVariation?: number
  typingSpeedVariation?: number
  scrollBehaviorConfig?: {
    speedVariation: number
    pauseProbability: number
    pauseDuration: number[]
  }
}

export interface TaskStats {
  total: number
  running: number
  completed: number
  failed: number
  successRate: number
}

export interface AccountStats {
  total: number
  active: number
  inactive: number
  errorRate: number
  successRate: number
}

export interface Activity {
  id: number
  accountId: number
  type: string
  status: string
  timestamp: string
  details: string
}

export interface Settings {
  maxTasksPerAccount: number
  taskIntervalMinutes: number
  proxyRotationInterval: number
  maxRetries: number
  retryDelaySeconds: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface AutomationConfig {
  maxSimultaneousWindows: number
  emailAccounts: EmailAccount[]
  proxies: Proxy[]
}

export enum TaskType {
  MARK_IMPORTANT = 'MARK_IMPORTANT',
  MOVE_FROM_SPAM = 'MOVE_FROM_SPAM',
  ARCHIVE_EMAIL = 'ARCHIVE_EMAIL',
  DELETE_EMAIL = 'DELETE_EMAIL',
  MARK_READ = 'MARK_READ',
  MARK_UNREAD = 'MARK_UNREAD',
  MOVE_TO_INBOX = 'MOVE_TO_INBOX',
  MOVE_TO_SPAM = 'MOVE_TO_SPAM',
  MOVE_TO_TRASH = 'MOVE_TO_TRASH',
  MOVE_TO_ARCHIVE = 'MOVE_TO_ARCHIVE',
  MOVE_TO_CATEGORY = 'MOVE_TO_CATEGORY',
  MOVE_TO_LABEL = 'MOVE_TO_LABEL',
  MOVE_TO_FOLDER = 'MOVE_TO_FOLDER',
  MOVE_TO_PRIORITY = 'MOVE_TO_PRIORITY',
  MOVE_TO_STARRED = 'MOVE_TO_STARRED'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
} 