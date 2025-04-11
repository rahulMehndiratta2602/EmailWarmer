import { TaskType, TaskStatus } from '@/enums/task'

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
  status: 'active' | 'inactive'
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
}

export interface TaskSchedule {
  startTime: string
  frequency: 'hourly' | 'daily' | 'weekly'
  interval: number
  priority: number
}

export interface HumanBehaviorParams {
  minDelay: number
  maxDelay: number
  randomActions: boolean
  mouseMovement: boolean
  scrollBehavior: boolean
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