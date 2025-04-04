import { useState } from 'react'
import useSWR from 'swr'
import { Task } from '@/types/api'
import { api } from '@/api/client'

export const useTasks = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: tasks = [], mutate } = useSWR<Task[]>('/api/v1/tasks', api.getTasks)

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.addTask(task)
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const editTask = async (id: number, task: Partial<Task>) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.editTask(id, task)
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeTask = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.removeTask(id)
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const startTask = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.startTask(id)
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start task')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const stopTask = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.stopTask(id)
      await mutate()
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
    addTask,
    editTask,
    removeTask,
    startTask,
    stopTask,
  }
} 