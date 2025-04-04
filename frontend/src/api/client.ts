import axios from 'axios'
import { EmailAccount, Task, TaskStats, AccountStats, Activity, Settings, ApiResponse } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Accounts
export const getAccounts = async (): Promise<ApiResponse<EmailAccount[]>> => {
  const response = await client.get<ApiResponse<EmailAccount[]>>('/api/v1/accounts')
  return response.data
}

export const createAccount = async (account: Omit<EmailAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EmailAccount>> => {
  const response = await client.post<ApiResponse<EmailAccount>>('/api/v1/accounts', account)
  return response.data
}

export const updateAccount = async (id: number, account: Partial<EmailAccount>): Promise<ApiResponse<EmailAccount>> => {
  const response = await client.put<ApiResponse<EmailAccount>>(`/api/v1/accounts/${id}`, account)
  return response.data
}

export const deleteAccount = async (id: number): Promise<ApiResponse<void>> => {
  const response = await client.delete<ApiResponse<void>>(`/api/v1/accounts/${id}`)
  return response.data
}

// Tasks
export const getTasks = async (): Promise<ApiResponse<Task[]>> => {
  const response = await client.get<ApiResponse<Task[]>>('/api/v1/tasks')
  return response.data
}

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Task>> => {
  const response = await client.post<ApiResponse<Task>>('/api/v1/tasks', task)
  return response.data
}

export const updateTask = async (id: number, task: Partial<Task>): Promise<ApiResponse<Task>> => {
  const response = await client.put<ApiResponse<Task>>(`/api/v1/tasks/${id}`, task)
  return response.data
}

export const deleteTask = async (id: number): Promise<ApiResponse<void>> => {
  const response = await client.delete<ApiResponse<void>>(`/api/v1/tasks/${id}`)
  return response.data
}

// Stats
export const getTaskStats = async (): Promise<ApiResponse<TaskStats>> => {
  const response = await client.get<ApiResponse<TaskStats>>('/api/v1/tasks/stats')
  return response.data
}

export const getAccountStats = async (): Promise<ApiResponse<AccountStats>> => {
  const response = await client.get<ApiResponse<AccountStats>>('/api/v1/accounts/stats')
  return response.data
}

// Activities
export const getRecentActivities = async (limit: number = 10): Promise<ApiResponse<Activity[]>> => {
  const response = await client.get<ApiResponse<Activity[]>>(`/api/v1/activities?limit=${limit}`)
  return response.data
}

// Settings
export const getSettings = async (): Promise<ApiResponse<Settings>> => {
  const response = await client.get<ApiResponse<Settings>>('/api/v1/settings')
  return response.data
}

export const updateSettings = async (settings: Partial<Settings>): Promise<ApiResponse<Settings>> => {
  const response = await client.put<ApiResponse<Settings>>('/api/v1/settings', settings)
  return response.data
}

export default client 