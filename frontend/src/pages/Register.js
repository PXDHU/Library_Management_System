import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useSnackbar } from '../context/SnackbarContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', password: '', email: '', fullName: '' });
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      showSnackbar('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      showSnackbar(err.message || 'Registration failed', 'error');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{ background: 'none' }}>
      <Paper elevation={3} sx={{
        p: { xs: 2, sm: 4 },
        width: { xs: '95%', sm: 370 },
        borderRadius: 4,
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 4px 24px 0 rgba(124,77,255,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <Typography variant="h5" mb={2} fontWeight={700} color="primary">Register</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField label="Username" name="username" fullWidth margin="normal" value={form.username} onChange={handleChange} required sx={{ borderRadius: 2 }} />
          <TextField label="Password" name="password" type="password" fullWidth margin="normal" value={form.password} onChange={handleChange} required sx={{ borderRadius: 2 }} />
          <TextField label="Email" name="email" fullWidth margin="normal" value={form.email} onChange={handleChange} required sx={{ borderRadius: 2 }} />
          <TextField label="Full Name" name="fullName" fullWidth margin="normal" value={form.fullName} onChange={handleChange} required sx={{ borderRadius: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}>Register</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 