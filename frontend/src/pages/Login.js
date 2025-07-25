import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useSnackbar } from '../context/SnackbarContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      showSnackbar('Invalid credentials', 'error');
    }
  };

  return (
    <Box minHeight="80vh" sx={{ background: 'none', position: 'relative' }}>
    
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{
          p: { xs: 2, sm: 4 },
          width: { xs: '95%', sm: 370 },
          borderRadius: 4,
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 4px 24px 0 rgba(124,77,255,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <Typography variant="h5" mb={2} fontWeight={700} color="primary">Login</Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required autoFocus sx={{ borderRadius: 2 }} />
            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required sx={{ borderRadius: 2 }} />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}>Login</Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login; 