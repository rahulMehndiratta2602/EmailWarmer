'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import { Task } from '@/types/api'
import useTasks from '@/hooks/useTasks'
import useAccounts from '@/hooks/useAccounts'
import LoadingErrorState from './LoadingErrorState'
import {
  validateAccountId,
  validateTaskType,
  validateTaskStatus,
  validateProgress,
  ValidationError,
} from '@/utils/validation'

interface TaskFormProps {
  open: boolean
  onClose: () => void
  task?: Task
}

const TaskForm = ({ open, onClose, task }: TaskFormProps) => {
  const { addTask, editTask, isLoading: isTasksLoading, error: tasksError } = useTasks()
  const { accounts, isLoading: isAccountsLoading, error: accountsError } = useAccounts()
  const [formData, setFormData] = useState<Partial<Task>>({
    accountId: task?.accountId || 0,
    type: task?.type || 'move_from_spam',
    status: task?.status || 'pending',
    progress: task?.progress || 0,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData({
        accountId: task?.accountId || 0,
        type: task?.type || 'move_from_spam',
        status: task?.status || 'pending',
        progress: task?.progress || 0,
      })
      setFormErrors({})
    }
  }, [open, task])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    const accountIdError = validateAccountId(formData.accountId || 0)
    if (accountIdError) errors[accountIdError.field] = accountIdError.message

    const typeError = validateTaskType(formData.type || '')
    if (typeError) errors[typeError.field] = typeError.message

    const statusError = validateTaskStatus(formData.status || '')
    if (statusError) errors[statusError.field] = statusError.message

    const progressError = validateProgress(formData.progress || 0)
    if (progressError) errors[progressError.field] = progressError.message

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (task) {
        await editTask(task.id, formData)
      } else {
        await addTask(formData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>)
      }
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the task'
      setFormErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for the field being changed
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const isLoading = isTasksLoading || isAccountsLoading
  const error = tasksError || accountsError

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {task ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <LoadingErrorState isLoading={isLoading} error={error}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth error={!!formErrors.accountId}>
                <InputLabel>Account</InputLabel>
                <Select
                  required
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  label="Account"
                >
                  {accounts.map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.email}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.accountId && (
                  <Box sx={{ color: 'error.main', mt: 1 }}>
                    {formErrors.accountId}
                  </Box>
                )}
              </FormControl>
              <FormControl fullWidth error={!!formErrors.type}>
                <InputLabel>Task Type</InputLabel>
                <Select
                  required
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Task Type"
                >
                  <MenuItem value="move_from_spam">Move from Spam</MenuItem>
                  <MenuItem value="mark_important">Mark as Important</MenuItem>
                  <MenuItem value="star">Star Email</MenuItem>
                  <MenuItem value="click_link">Click Link</MenuItem>
                  <MenuItem value="reply">Reply to Email</MenuItem>
                </Select>
                {formErrors.type && (
                  <Box sx={{ color: 'error.main', mt: 1 }}>
                    {formErrors.type}
                  </Box>
                )}
              </FormControl>
              <FormControl fullWidth error={!!formErrors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  required
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="running">Running</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
                {formErrors.status && (
                  <Box sx={{ color: 'error.main', mt: 1 }}>
                    {formErrors.status}
                  </Box>
                )}
              </FormControl>
              <TextField
                label="Progress"
                name="progress"
                type="number"
                value={formData.progress}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.progress}
                helperText={formErrors.progress}
                inputProps={{ min: 0, max: 100 }}
              />
              {formErrors.submit && (
                <Box sx={{ color: 'error.main', mt: 1 }}>
                  {formErrors.submit}
                </Box>
              )}
            </Box>
          </LoadingErrorState>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TaskForm 