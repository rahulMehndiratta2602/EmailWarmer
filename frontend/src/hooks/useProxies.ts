import { useState } from 'react'
import { Proxy } from '@/types/api'
import * as api from '@/api/client'

export const useProxies = () => {
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProxies = async () => {
    try {
      setIsLoading(true)
      const response = await api.getProxies()
      setProxies(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proxies')
    } finally {
      setIsLoading(false)
    }
  }

  const addProxy = async (proxy: Omit<Proxy, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true)
      const response = await api.createProxy({ ...proxy, assignedAccounts: 0 })
      setProxies(prev => [...prev, response.data])
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add proxy')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const editProxy = async (id: number, proxy: Partial<Proxy>) => {
    try {
      setIsLoading(true)
      const response = await api.updateProxy(id, proxy)
      setProxies(prev => prev.map(p => p.id === id ? response.data : p))
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit proxy')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeProxy = async (id: number) => {
    try {
      setIsLoading(true)
      await api.deleteProxy(id)
      setProxies(prev => prev.filter(p => p.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove proxy')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    proxies,
    isLoading,
    error,
    fetchProxies,
    addProxy,
    editProxy,
    removeProxy,
  }
}

export default useProxies 