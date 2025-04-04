import { TaskType, TaskStatus } from '@/enums/task'

export interface EmailAccount {
  id: number
  email: string
  password: string
  provider: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface HumanBehaviorParams {
  minDelay: number
  maxDelay: number
  mouseMovementVariation: number
  typingSpeedVariation: number
  scrollBehavior: {
    speedVariation: number
    pauseProbability: number
    pauseDuration: [number, number]
  }
}

export interface Task {
  id: number
  accountId: number
  actionType: TaskType
  status: TaskStatus
  schedule: {
    startTime: string
    frequency: 'daily' | 'weekly'
    interval: number
  }
  humanBehavior: HumanBehaviorParams
  createdAt: string
  updatedAt: string
  lastRun?: string
  nextRun?: string
  progress: number
  errorCount: number
  successCount: number
  proxyId?: number
}

export interface TaskStats {
  totalTasks: number
  activeTasks: number
  completedTasks: number
  failedTasks: number
  averageSuccessRate: number
  averageExecutionTime: number
}

export interface AccountStats {
  totalAccounts: number
  activeAccounts: number
  inactiveAccounts: number
  averageActionsPerAccount: number
  successRate: number
}

export interface Activity {
  id: number
  accountId: number
  actionType: string
  status: string
  timestamp: string
  details: Record<string, any>
}

export interface Settings {
  id: number
  proxyRotationInterval: number
  maxConcurrentTasks: number
  defaultHumanBehavior: HumanBehaviorParams
  notificationSettings: {
    email: boolean
    desktop: boolean
  }
}

export interface ProxyStats {
  activeProxies: number
  backupProxies: number
  totalProxies: number
  averageResponseTime: number
  unhealthyProxies: number
  rotationInterval: number
  lastRotation: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
} 