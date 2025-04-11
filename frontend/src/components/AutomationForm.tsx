'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { EmailAccount, Proxy, AutomationConfig } from '@/types/api'

const AutomationForm = () => {
  const [emailFile, setEmailFile] = useState<File | null>(null)
  const [proxyFile, setProxyFile] = useState<File | null>(null)
  const [maxWindows, setMaxWindows] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setEmailFile(file)
    }
  }

  const handleProxyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProxyFile(file)
    }
  }

  const handleMaxWindowsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    if (!isNaN(value) && value > 0) {
      setMaxWindows(value)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!emailFile || !proxyFile) {
        throw new Error('Please upload both email and proxy files')
      }

      // Here you would typically send the files to your backend
      // and start the automation process
      const config: AutomationConfig = {
        maxSimultaneousWindows: maxWindows,
        emailAccounts: [], // This would be populated from the email file
        proxies: [], // This would be populated from the proxy file
      }

      // Start the automation process
      console.log('Starting automation with config:', config)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Email Automation Setup
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Upload Email Accounts (CSV)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                {emailFile ? emailFile.name : 'Choose Email File'}
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleEmailFileChange}
                />
              </Button>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Upload Proxy Servers (CSV)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                {proxyFile ? proxyFile.name : 'Choose Proxy File'}
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleProxyFileChange}
                />
              </Button>
            </Box>

            <TextField
              label="Maximum Simultaneous Windows"
              type="number"
              value={maxWindows}
              onChange={handleMaxWindowsChange}
              inputProps={{ min: 1 }}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !emailFile || !proxyFile}
              fullWidth
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Start Automation'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}

export default AutomationForm 