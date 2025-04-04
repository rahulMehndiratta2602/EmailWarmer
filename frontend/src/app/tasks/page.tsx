'use client'

import { useState } from 'react'
import { Box, Typography, Button, Paper, Chip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Add as AddIcon, PlayArrow as PlayIcon, Stop as StopIcon } from '@mui/icons-material'
import TaskForm from '@/components/TaskForm'
import { useTasks } from '@/hooks/useTasks'
import { Task } from '@/types/api'

const TasksPage = () => {
  const { tasks, isLoading, error, removeTask, startTask, stopTask } = useTasks()
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await removeTask(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'primary'
      case 'completed':
        return 'success'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const columns: GridColDef[] = [
    { field: 'accountId', headerName: 'Account', flex: 1 },
    { field: 'type', headerName: 'Task Type', flex: 1 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    { field: 'progress', headerName: 'Progress', flex: 1 },
    { field: 'nextRun', headerName: 'Next Run', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          {params.row.status === 'running' ? (
            <Button
              size="small"
              color="error"
              startIcon={<StopIcon />}
              onClick={() => stopTask(params.row.id)}
            >
              Stop
            </Button>
          ) : (
            <Button
              size="small"
              color="primary"
              startIcon={<PlayIcon />}
              onClick={() => startTask(params.row.id)}
            >
              Start
            </Button>
          )}
          <Button
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => {
            setSelectedTask(undefined)
            setIsFormOpen(true)
          }}
        >
          Create Task
        </Button>
      </Box>

      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={tasks}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5 },
            },
          }}
          loading={isLoading}
          disableRowSelectionOnClick
        />
      </Paper>

      <TaskForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        task={selectedTask}
      />
    </Box>
  )
}

export default TasksPage 