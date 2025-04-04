import useSWR from 'swr'
import { TaskStats, AccountStats, Activity } from '@/types/api'
import { getTaskStats, getAccountStats, getRecentActivities } from '@/api/client'

const useStats = () => {
  const { data: taskStats, error: taskStatsError } = useSWR<TaskStats>('/api/v1/tasks/stats', getTaskStats)
  const { data: accountStats, error: accountStatsError } = useSWR<AccountStats>('/api/v1/accounts/stats', getAccountStats)
  const { data: activities, error: activitiesError } = useSWR<Activity[]>('/api/v1/activities', () => getRecentActivities(10))

  return {
    taskStats: taskStats || { total: 0, active: 0, completed: 0, failed: 0 },
    accountStats: accountStats || { total: 0, active: 0, inactive: 0 },
    activities: activities || [],
    isLoading: (!taskStatsError && !taskStats) || (!accountStatsError && !accountStats) || (!activitiesError && !activities),
    isError: taskStatsError || accountStatsError || activitiesError,
  }
}

export default useStats 