import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material'
import { Email as EmailIcon, Dashboard as DashboardIcon, Settings as SettingsIcon } from '@mui/icons-material'
import Link from 'next/link'

const Header = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <EmailIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Email Warmup
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<DashboardIcon />}
            color="inherit"
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            href="/accounts"
            color="inherit"
          >
            Accounts
          </Button>
          <Button
            component={Link}
            href="/tasks"
            color="inherit"
          >
            Tasks
          </Button>
          <IconButton
            component={Link}
            href="/settings"
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header 