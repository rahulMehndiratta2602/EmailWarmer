'use client'

import { Box, CircularProgress, Alert, Typography } from '@mui/material'

interface LoadingErrorStateProps {
  isLoading: boolean
  error: string | null
  children: React.ReactNode
}

const LoadingErrorState = ({ isLoading, error, children }: LoadingErrorStateProps) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          <Typography variant="body1">{error}</Typography>
        </Alert>
      </Box>
    )
  }

  return <>{children}</>
}

export default LoadingErrorState 