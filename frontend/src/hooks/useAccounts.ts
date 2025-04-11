import { useState } from 'react'
import { EmailAccount } from '@/types/api'
import * as api from '@/api/client'

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const response = await api.getAccounts()
      setAccounts(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const addAccount = async (account: Omit<EmailAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true)
      const response = await api.createAccount(account)
      setAccounts(prev => [...prev, response.data])
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const editAccount = async (id: number, account: Partial<EmailAccount>) => {
    try {
      setIsLoading(true)
      const response = await api.updateAccount(id, account)
      setAccounts(prev => prev.map(a => a.id === id ? response.data : a))
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeAccount = async (id: number) => {
    try {
      setIsLoading(true)
      await api.deleteAccount(id)
      setAccounts(prev => prev.filter(a => a.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const assignProxy = async (accountId: number, proxyId: number) => {
    try {
      setIsLoading(true)
      const response = await api.assignProxy(accountId, proxyId)
      setAccounts(prev => prev.map(a => a.id === accountId ? response.data : a))
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign proxy')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const setRecoveryEmail = async (accountId: number, recoveryEmail: string) => {
    try {
      setIsLoading(true)
      const response = await api.setRecoveryEmail(accountId, recoveryEmail)
      setAccounts(prev => prev.map(a => a.id === accountId ? response.data : a))
      setError(null)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set recovery email')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    addAccount,
    editAccount,
    removeAccount,
    assignProxy,
    setRecoveryEmail,
  }
}

export default useAccounts 