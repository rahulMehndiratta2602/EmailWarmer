import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Slider, 
  Switch, 
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { ipcRenderer } from 'electron';
import { EmailAccount, Proxy, Task } from './types';

const App: React.FC = () => {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [concurrentWindows, setConcurrentWindows] = useState(5);
  const [speed, setSpeed] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (type: 'email' | 'proxy') => {
    try {
      const filePath = await ipcRenderer.invoke('select-file');
      if (filePath) {
        // Process file based on type
        setLoading(true);
        // TODO: Implement file processing
        setLoading(false);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    // TODO: Implement task execution
  };

  const handleStop = () => {
    setIsRunning(false);
    // TODO: Implement task stopping
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Email Warmup System
        </Typography>

        <Grid container spacing={3}>
          {/* Email Accounts Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Email Accounts
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleFileUpload('email')}
                disabled={loading}
              >
                Upload Email List
              </Button>
              {loading && <CircularProgress size={24} />}
            </Paper>
          </Grid>

          {/* Proxy Configuration */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Proxy Configuration
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleFileUpload('proxy')}
                disabled={loading}
              >
                Upload Proxy List
              </Button>
            </Paper>
          </Grid>

          {/* Control Panel */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Control Panel
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Concurrent Windows</Typography>
                  <Slider
                    value={concurrentWindows}
                    onChange={(_, value) => setConcurrentWindows(value as number)}
                    min={1}
                    max={10}
                    marks
                    step={1}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Speed</Typography>
                  <Slider
                    value={speed}
                    onChange={(_, value) => setSpeed(value as number)}
                    min={1}
                    max={100}
                    marks
                    step={1}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color={isRunning ? 'error' : 'primary'}
                    onClick={isRunning ? handleStop : handleStart}
                    fullWidth
                  >
                    {isRunning ? 'Stop' : 'Start'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Task Status */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Task Status
              </Typography>
              {/* TODO: Implement task status display */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default App; 