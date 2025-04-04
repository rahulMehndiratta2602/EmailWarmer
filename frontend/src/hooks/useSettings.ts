import useSWR from 'swr'
import { Settings } from '@/types/api'
import { getSettings, updateSettings } from '@/api/client'

const useSettings = () => {
  const { data, error, mutate } = useSWR<Settings>('/api/v1/settings', getSettings)

  const update = async (settings: Partial<Settings>) => {
    const response = await updateSettings(settings)
    if (response.success) {
      await mutate()
    }
    return response
  }

  return {
    settings: data,
    isLoading: !error && !data,
    isError: error,
    update,
    refresh: mutate,
  }
}

export default useSettings 