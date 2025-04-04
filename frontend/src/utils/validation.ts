export interface ValidationError {
  field: string
  message: string
}

export const validateEmail = (email: string): ValidationError | null => {
  if (!email) {
    return { field: 'email', message: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' }
  }

  return null
}

export const validateProvider = (provider: string): ValidationError | null => {
  if (!provider) {
    return { field: 'provider', message: 'Provider is required' }
  }

  const validProviders = ['gmail', 'outlook', 'yahoo']
  if (!validProviders.includes(provider)) {
    return { field: 'provider', message: 'Please select a valid email provider' }
  }

  return null
}

export const validateStatus = (status: string): ValidationError | null => {
  if (!status) {
    return { field: 'status', message: 'Status is required' }
  }

  const validStatuses = ['active', 'inactive']
  if (!validStatuses.includes(status)) {
    return { field: 'status', message: 'Please select a valid status' }
  }

  return null
}

export const validateAccountId = (accountId: number): ValidationError | null => {
  if (!accountId) {
    return { field: 'accountId', message: 'Account is required' }
  }

  if (accountId <= 0) {
    return { field: 'accountId', message: 'Please select a valid account' }
  }

  return null
}

export const validateTaskType = (type: string): ValidationError | null => {
  if (!type) {
    return { field: 'type', message: 'Task type is required' }
  }

  const validTypes = [
    'move_from_spam',
    'mark_important',
    'star',
    'click_link',
    'reply'
  ]
  if (!validTypes.includes(type)) {
    return { field: 'type', message: 'Please select a valid task type' }
  }

  return null
}

export const validateTaskStatus = (status: string): ValidationError | null => {
  if (!status) {
    return { field: 'status', message: 'Status is required' }
  }

  const validStatuses = ['pending', 'running', 'completed', 'failed']
  if (!validStatuses.includes(status)) {
    return { field: 'status', message: 'Please select a valid status' }
  }

  return null
}

export const validateProgress = (progress: number): ValidationError | null => {
  if (progress < 0 || progress > 100) {
    return { field: 'progress', message: 'Progress must be between 0 and 100' }
  }

  return null
} 