import { Box, Typography, Paper, TextField, Button, FormControlLabel, Switch, Grid } from '@mui/material'
import { Save as SaveIcon } from '@mui/icons-material'

const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="API Base URL"
                defaultValue="http://localhost:8000"
                margin="normal"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Default Task Interval (minutes)"
                type="number"
                defaultValue="30"
                margin="normal"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Email Notifications"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                defaultValue="30"
                margin="normal"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Require Two-Factor Authentication"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable IP Whitelist"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              color="primary"
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SettingsPage 