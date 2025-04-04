'use client'

import { Grid, Paper, Typography, Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  // Mock data for demonstration
  const stats = [
    { name: 'Total Accounts', value: 25 },
    { name: 'Active Tasks', value: 12 },
    { name: 'Emails Processed', value: 1500 },
    { name: 'Success Rate', value: '98%' },
  ]

  const recentActivity = [
    { id: 1, account: 'user1@gmail.com', action: 'Moved from spam', date: '2024-01-15' },
    { id: 2, account: 'user2@outlook.com', action: 'Marked as important', date: '2024-01-15' },
    { id: 3, account: 'user3@yahoo.com', action: 'Clicked link', date: '2024-01-14' },
  ]

  const activityData = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 20 },
    { name: 'Thu', value: 27 },
    { name: 'Fri', value: 18 },
    { name: 'Sat', value: 23 },
    { name: 'Sun', value: 34 },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.name}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" color="text.secondary">
                {stat.name}
              </Typography>
              <Typography variant="h4">
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Activity Overview
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <DataGrid
              rows={recentActivity}
              columns={[
                { field: 'account', headerName: 'Account', flex: 1 },
                { field: 'action', headerName: 'Action', flex: 1 },
                { field: 'date', headerName: 'Date', flex: 1 },
              ]}
              hideFooter
              disableRowSelectionOnClick
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard 