import useSWR from 'swr'
import { EmailAccount } from '@/types/api'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/api/client'

const useAccounts = () => {
  const { data, error, mutate } = useSWR<EmailAccount[]>('/api/v1/accounts', getAccounts)

  const addAccount = async (account: Omit<EmailAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await createAccount(account)
    if (response.success) {
      await mutate()
    }
    return response
  }

  const editAccount = async (id: number, account: Partial<EmailAccount>) => {
    const response = await updateAccount(id, account)
    if (response.success) {
      await mutate()
    }
    return response
  }

  const removeAccount = async (id: number) => {
    const response = await deleteAccount(id)
    if (response.success) {
      await mutate()
    }
    return response
  }

  return {
    accounts: data || [],
    isLoading: !error && !data,
    isError: error,
    addAccount,
    editAccount,
    removeAccount,
    refresh: mutate,
  }
}

export default useAccounts 