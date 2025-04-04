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
} from '@mui/material'
import { EmailAccount } from '@/types/api'
import useAccounts from '@/hooks/useAccounts'
import LoadingErrorState from './LoadingErrorState'
import { validateEmail, validateProvider, validateStatus, ValidationError } from '@/utils/validation'

interface AccountFormProps {
  open: boolean
  onClose: () => void
  account?: EmailAccount
}

const AccountForm = ({ open, onClose, account }: AccountFormProps) => {
  const { addAccount, editAccount, isLoading, isError: error } = useAccounts()
  const [formData, setFormData] = useState<Partial<EmailAccount>>({
    email: account?.email || '',
    provider: account?.provider || 'gmail',
    status: account?.status || 'active',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData({
        email: account?.email || '',
        provider: account?.provider || 'gmail',
        status: account?.status || 'active',
      })
      setFormErrors({})
    }
  }, [open, account])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    const emailError = validateEmail(formData.email || '')
    if (emailError) errors[emailError.field] = emailError.message

    const providerError = validateProvider(formData.provider || '')
    if (providerError) errors[providerError.field] = providerError.message

    const statusError = validateStatus(formData.status || '')
    if (statusError) errors[statusError.field] = statusError.message

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
      if (account) {
        await editAccount(account.id, formData)
      } else {
        await addAccount(formData as Omit<EmailAccount, 'id' | 'createdAt' | 'updatedAt'>)
      }
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the account'
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

export default AccountForm 