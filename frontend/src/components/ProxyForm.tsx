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
  Switch,
  FormControlLabel,
} from '@mui/material'
import { Proxy } from '@/types/api'
import { useProxies } from '@/hooks/useProxies'
import LoadingErrorState from './LoadingErrorState'

interface ProxyFormProps {
  open: boolean
  onClose: () => void
  proxy?: Proxy
}

const ProxyForm = ({ open, onClose, proxy }: ProxyFormProps) => {
  const { addProxy, editProxy, isLoading, error } = useProxies()
  const [formData, setFormData] = useState<Partial<Proxy>>({
    host: proxy?.host || '',
    port: proxy?.port || 0,
    username: proxy?.username || '',
    password: proxy?.password || '',
    protocol: proxy?.protocol || 'http',
    useExtension: proxy?.useExtension || false,
    status: proxy?.status || 'active',
    maxAccounts: proxy?.maxAccounts || 10,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData({
        host: proxy?.host || '',
        port: proxy?.port || 0,
        username: proxy?.username || '',
        password: proxy?.password || '',
        protocol: proxy?.protocol || 'http',
        useExtension: proxy?.useExtension || false,
        status: proxy?.status || 'active',
        maxAccounts: proxy?.maxAccounts || 10,
      })
      setFormErrors({})
    }
  }, [open, proxy])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.host) {
      errors.host = 'Host is required'
    }
    
    if (!formData.port || formData.port <= 0 || formData.port > 65535) {
      errors.port = 'Port must be between 1 and 65535'
    }

    if (!formData.maxAccounts || formData.maxAccounts <= 0) {
      errors.maxAccounts = 'Maximum accounts must be greater than 0'
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
      if (proxy) {
        await editProxy(proxy.id, formData)
      } else {
        await addProxy(formData as Omit<Proxy, 'id' | 'createdAt' | 'updatedAt'>)
      }
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the proxy'
      setFormErrors({ submit: errorMessage })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }))
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {proxy ? 'Edit Proxy' : 'Add New Proxy'}
        </DialogTitle>
        <DialogContent>
          <LoadingErrorState isLoading={isLoading} error={error}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                required
                label="Host"
                name="host"
                value={formData.host}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.host}
                helperText={formErrors.host}
              />
              <TextField
                required
                type="number"
                label="Port"
                name="port"
                value={formData.port}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.port}
                helperText={formErrors.port}
              />
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                required
                select
                label="Protocol"
                name="protocol"
                value={formData.protocol}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="http">HTTP</MenuItem>
                <MenuItem value="https">HTTPS</MenuItem>
                <MenuItem value="socks5">SOCKS5</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useExtension}
                    onChange={handleChange}
                    name="useExtension"
                  />
                }
                label="Use Browser Extension"
              />
              <TextField
                required
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
              <TextField
                required
                type="number"
                label="Maximum Accounts"
                name="maxAccounts"
                value={formData.maxAccounts}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.maxAccounts}
                helperText={formErrors.maxAccounts}
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
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProxyForm 