'use client'

import { useState } from 'react'
import { Box, Typography, Button, Paper, Chip, Alert } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Add as AddIcon } from '@mui/icons-material'
import ProxyForm from '@/components/ProxyForm'
import { useProxies } from '@/hooks/useProxies'
import { Proxy } from '@/types/api'

const ProxiesPage = () => {
  const { proxies, isLoading, error, removeProxy } = useProxies()
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleEdit = (proxy: Proxy) => {
    setSelectedProxy(proxy)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this proxy?')) {
      try {
        await removeProxy(id)
        setActionError(null)
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to delete proxy')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'error'
      default:
        return 'default'
    }
  }

  const columns: GridColDef[] = [
    { field: 'host', headerName: 'Host', flex: 1 },
    { field: 'port', headerName: 'Port', flex: 1 },
    { field: 'protocol', headerName: 'Protocol', flex: 1 },
    { field: 'useExtension', headerName: 'Extension', flex: 1, renderCell: (params) => params.value ? 'Yes' : 'No' },
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
    { field: 'assignedAccounts', headerName: 'Assigned', flex: 1 },
    { field: 'maxAccounts', headerName: 'Max Accounts', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
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
          Proxies
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => {
            setSelectedProxy(undefined)
            setIsFormOpen(true)
          }}
        >
          Add Proxy
        </Button>
      </Box>

      {(error || actionError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || actionError}
        </Alert>
      )}

      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={proxies}
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

      <ProxyForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        proxy={selectedProxy}
      />
    </Box>
  )
}

export default ProxiesPage 