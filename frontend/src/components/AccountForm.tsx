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
  SelectChangeEvent,
} from '@mui/material'
import { EmailAccount } from '@/types/api'
import { useAccounts } from '@/hooks/useAccounts'
import { useProxies } from '@/hooks/useProxies'
import LoadingErrorState from './LoadingErrorState'

interface AccountFormProps {
  open: boolean
  onClose: () => void
  account?: EmailAccount
}

const AccountForm = ({ open, onClose, account }: AccountFormProps) => {
  const { addAccount, editAccount, isLoading: isAccountLoading, error: accountError } = useAccounts()
  const { proxies, isLoading: isProxyLoading, error: proxyError } = useProxies()
  const [formData, setFormData] = useState<Partial<EmailAccount>>({
    email: account?.email || '',
    password: account?.password || '',
    provider: account?.provider || 'gmail',
    status: account?.status || 'active',
    proxyId: account?.proxyId,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData({
        email: account?.email || '',
        password: account?.password || '',
        provider: account?.provider || 'gmail',
        status: account?.status || 'active',
        proxyId: account?.proxyId,
      })
      setFormErrors({})
    }
  }, [open, account])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    if (!formData.provider) {
      errors.provider = 'Provider is required'
    }

    if (!formData.status) {
      errors.status = 'Status is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    if (!validateForm()) {
      return
    }

    try {
      if (account) {
        await editAccount(account.id, formData)
      } else {
        await addAccount(formData as Omit<EmailAccount, 'id'>)
      }
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the account'
      setFormErrors({ submit: errorMessage })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
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

  const isLoading = isAccountLoading || isProxyLoading
  const error = accountError || proxyError

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {account ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <LoadingErrorState isLoading={isLoading} error={error}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                required
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              <TextField
                required
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
              <TextField
                required
                select
                label="Provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.provider}
                helperText={formErrors.provider}
              >
                <MenuItem value="gmail">Gmail</MenuItem>
                <MenuItem value="outlook">Outlook</MenuItem>
                <MenuItem value="yahoo">Yahoo</MenuItem>
              </TextField>
              <TextField
                required
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.status}
                helperText={formErrors.status}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
              <FormControl fullWidth>
                <InputLabel>Proxy</InputLabel>
                <Select
                  name="proxyId"
                  value={formData.proxyId || ''}
                  onChange={handleSelectChange}
                  label="Proxy"
                >
                  <MenuItem value="">None</MenuItem>
                  {proxies.map((proxy) => (
                    <MenuItem
                      key={proxy.id}
                      value={proxy.id}
                    >
                      {proxy.host}:{proxy.port}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default AccountForm 