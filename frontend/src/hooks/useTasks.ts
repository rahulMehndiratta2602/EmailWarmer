import { useState } from 'react'
import { Task } from '@/types/api'
import api from '@/api/client'

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Task[]>('/tasks')
      setTasks(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true)
      const response = await api.post<Task>('/tasks', task)
      setTasks(prev => [...prev, response.data])
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const editTask = async (id: number, task: Partial<Task>) => {
    try {
      setIsLoading(true)
      const response = await api.patch<Task>(`/tasks/${id}`, task)
      setTasks(prev => prev.map(t => t.id === id ? response.data : t))
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeTask = async (id: number) => {
    try {
      setIsLoading(true)
      await api.delete(`/tasks/${id}`)
      setTasks(prev => prev.filter(t => t.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const startTask = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await api.post<Task>(`/tasks/${id}/start`)
      setTasks(prev => prev.map(t => t.id === id ? response.data : t))
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const stopTask = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await api.post<Task>(`/tasks/${id}/stop`)
      setTasks(prev => prev.map(t => t.id === id ? response.data : t))
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    startTask,
    stopTask,
  }
} 