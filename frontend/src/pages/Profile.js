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
    <Box p={3} display="flex" justifyContent="center">
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h4" mb={2}>Profile</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Full Name" name="fullName" fullWidth margin="normal" value={form.fullName} onChange={handleChange} />
          <TextField label="Email" name="email" fullWidth margin="normal" value={form.email} onChange={handleChange} />
          <TextField label="Location" name="location" fullWidth margin="normal" value={form.location} onChange={handleChange} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Update</Button>
        </form>
      </Paper>
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
};

export default Profile; 