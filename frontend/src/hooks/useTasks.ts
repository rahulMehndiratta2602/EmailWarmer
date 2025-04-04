import { useState } from 'react'
import useSWR from 'swr'
import * as api from '@/api/client'
import { Task, ApiResponse } from '@/types/api'

export function useTasks() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data, error: swrError, mutate } = useSWR<ApiResponse<Task[]>>('/api/v1/tasks', api.getTasks)

  const handleError = (err: unknown): string => {
    if (err instanceof Error) {
      return err.message
    }
    if (typeof err === 'string') {
      return err
    }
    if (err && typeof err === 'object' && 'message' in err) {
      return String(err.message)
    }
    return 'An unexpected error occurred'
  }

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      const response = await api.createTask(task)
      await mutate()
      return response.data
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = async (id: number, task: Partial<Task>) => {
    setIsLoading(true)
    try {
      const response = await api.updateTask(id, task)
      await mutate()
      return response.data
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const removeTask = async (id: number) => {
    setIsLoading(true)
    try {
      await api.deleteTask(id)
      await mutate()
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const startTask = async (id: number) => {
    return updateTask(id, { status: 'running' })
  }

  const stopTask = async (id: number) => {
    return updateTask(id, { status: 'failed' })
  }

  return {
    tasks: data?.data || [],
    isLoading: isLoading || !data,
    error: error || (swrError ? handleError(swrError) : null),
    addTask,
    updateTask,
    removeTask,
    startTask,
    stopTask,
  }
}

export default useTasks 