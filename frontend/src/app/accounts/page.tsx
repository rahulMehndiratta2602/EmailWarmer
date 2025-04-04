'use client'

import { useState } from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Add as AddIcon } from '@mui/icons-material'
import AccountForm from '@/components/AccountForm'
import useAccounts from '@/hooks/useAccounts'
import { EmailAccount } from '@/types/api'

const AccountsPage = () => {
  const { accounts, isLoading, isError, removeAccount } = useAccounts()
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (account: EmailAccount) => {
    setSelectedAccount(account)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      await removeAccount(id)
    }
  }

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'provider', headerName: 'Provider', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'lastActivity', headerName: 'Last Activity', flex: 1 },
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
          Email Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => {
            setSelectedAccount(undefined)
            setIsFormOpen(true)
          }}
        >
          Add Account
        </Button>
      </Box>

      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={accounts}
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

      <AccountForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        account={selectedAccount}
      />
    </Box>
  )
}

export default AccountsPage 