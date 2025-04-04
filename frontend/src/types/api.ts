export interface EmailAccount {
  id: number
  email: string
  provider: 'gmail' | 'outlook' | 'yahoo'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: number
  accountId: number
  type: 'move_from_spam' | 'mark_important' | 'star' | 'click_link' | 'reply'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  createdAt: string
  updatedAt: string
}

export interface TaskStats {
  total: number
  running: number
  completed: number
  failed: number
}

export interface AccountStats {
  total: number
  active: number
  inactive: number
}

export interface Activity {
  id: number
  accountId: number
  taskId: number
  action: string
  status: 'success' | 'failed'
  message: string
  createdAt: string
}

export interface Settings {
  maxConcurrentTasks: number
  taskInterval: number
  retryAttempts: number
  retryDelay: number
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
} 