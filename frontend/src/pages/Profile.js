import React, { useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, TextField, Button, Paper, Snackbar } from '@mui/material';

const Profile = () => {
  const { user, token } = useContext(AuthContext);
  const [form, setForm] = useState({ fullName: '', email: '', location: '' });
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/users/profile/${user?.userId || user?.id || user?.sub}`);
      setForm({
        fullName: res.data.fullName || '',
        email: res.data.email || '',
        location: res.data.location || ''
      });
    } catch {}
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${user?.userId || user?.id || user?.sub}`, form);
      setSnackbar('Profile updated!');
    } catch {
      setSnackbar('Failed to update profile');
    }
  };

  return (
    <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{ background: 'none' }}>
      <Paper elevation={3} sx={{
        p: { xs: 2, sm: 4 },
        width: { xs: '95%', sm: 400 },
        borderRadius: 4,
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 4px 24px 0 rgba(124,77,255,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <Typography variant="h4" mb={2} fontWeight={700} color="primary">Profile</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField label="Full Name" name="fullName" fullWidth margin="normal" value={form.fullName} onChange={handleChange} sx={{ borderRadius: 2 }} />
          <TextField label="Email" name="email" fullWidth margin="normal" value={form.email} onChange={handleChange} sx={{ borderRadius: 2 }} />
          <TextField label="Location" name="location" fullWidth margin="normal" value={form.location} onChange={handleChange} sx={{ borderRadius: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}>Update</Button>
        </form>
      </Paper>
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
};

export default Profile; 