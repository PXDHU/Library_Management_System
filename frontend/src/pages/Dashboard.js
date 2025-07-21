import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, Paper } from '@mui/material';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return (
    <Box p={3}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4">Welcome, {user?.fullName || user?.sub || 'User'}!</Typography>
        <Typography variant="body1" mt={2}>This is your dashboard. Recommendations and stats will appear here.</Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard; 