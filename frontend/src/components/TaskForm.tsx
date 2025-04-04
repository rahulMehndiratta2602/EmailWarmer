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
  Grid,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import { Task, TaskType, TaskStatus } from '@/types/api'
import { useTasks } from '@/hooks/useTasks'
import LoadingErrorState from './LoadingErrorState'

interface TaskFormProps {
  open: boolean
  onClose: () => void
  task?: Task
}

const TaskForm = ({ open, onClose, task }: TaskFormProps) => {
  const { addTask, editTask, isLoading, isError: error } = useTasks()
  const [formData, setFormData] = useState<Partial<Task>>({
    accountId: task?.accountId || 0,
    actionType: task?.actionType || TaskType.MARK_IMPORTANT,
    status: task?.status || TaskStatus.PENDING,
    schedule: task?.schedule || {
      startTime: new Date().toISOString(),
      frequency: 'daily',
      interval: 24,
    },
    humanBehavior: task?.humanBehavior || {
      minDelay: 1000,
      maxDelay: 3000,
      mouseMovementVariation: 0.2,
      typingSpeedVariation: 0.3,
      scrollBehavior: {
        speedVariation: 0.2,
        pauseProbability: 0.3,
        pauseDuration: [500, 2000],
      },
    },
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData({
        accountId: task?.accountId || 0,
        actionType: task?.actionType || TaskType.MARK_IMPORTANT,
        status: task?.status || TaskStatus.PENDING,
        schedule: task?.schedule || {
          startTime: new Date().toISOString(),
          frequency: 'daily',
          interval: 24,
        },
        humanBehavior: task?.humanBehavior || {
          minDelay: 1000,
          maxDelay: 3000,
          mouseMovementVariation: 0.2,
          typingSpeedVariation: 0.3,
          scrollBehavior: {
            speedVariation: 0.2,
            pauseProbability: 0.3,
            pauseDuration: [500, 2000],
          },
        },
      })
      setFormErrors({})
    }
  }, [open, task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

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
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleHumanBehaviorChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      humanBehavior: {
        ...prev.humanBehavior,
        [field]: value,
      },
    }))
  }

  const handleScheduleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value,
      },
    }))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {task ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <LoadingErrorState isLoading={isLoading} error={error}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    type="number"
                    label="Account ID"
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.accountId}
                    helperText={formErrors.accountId}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Action Type</InputLabel>
                    <Select
                      value={formData.actionType}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionType: e.target.value as TaskType }))}
                      label="Action Type"
                    >
                      {Object.values(TaskType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.replace(/_/g, ' ').toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Schedule
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    type="datetime-local"
                    label="Start Time"
                    value={formData.schedule?.startTime?.split('.')[0]}
                    onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={formData.schedule?.frequency}
                      onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                      label="Frequency"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Interval (hours)</Typography>
                  <Slider
                    value={formData.schedule?.interval || 24}
                    onChange={(_, value) => handleScheduleChange('interval', value as number)}
                    min={1}
                    max={168}
                    step={1}
                    marks={[
                      { value: 1, label: '1h' },
                      { value: 24, label: '24h' },
                      { value: 168, label: '168h' },
                    ]}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Human Behavior Parameters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Min Delay (ms)</Typography>
                  <Slider
                    value={formData.humanBehavior?.minDelay || 1000}
                    onChange={(_, value) => handleHumanBehaviorChange('minDelay', value as number)}
                    min={500}
                    max={5000}
                    step={100}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Max Delay (ms)</Typography>
                  <Slider
                    value={formData.humanBehavior?.maxDelay || 3000}
                    onChange={(_, value) => handleHumanBehaviorChange('maxDelay', value as number)}
                    min={1000}
                    max={10000}
                    step={100}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Mouse Movement Variation</Typography>
                  <Slider
                    value={formData.humanBehavior?.mouseMovementVariation || 0.2}
                    onChange={(_, value) => handleHumanBehaviorChange('mouseMovementVariation', value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Typing Speed Variation</Typography>
                  <Slider
                    value={formData.humanBehavior?.typingSpeedVariation || 0.3}
                    onChange={(_, value) => handleHumanBehaviorChange('typingSpeedVariation', value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </Grid>
              </Grid>

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
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TaskForm 