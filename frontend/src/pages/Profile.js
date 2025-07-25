import React, { useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, Paper, Snackbar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from '../context/SnackbarContext';

const Profile = () => {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState({ id: null, username: '', fullName: '', email: '' });
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [editOpen, setEditOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (user && token) {
      fetchProfile();
    }
    // eslint-disable-next-line
  }, [user, token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile');
      console.log('Profile response:', res.data);
      setProfile({
        id: res.data.id,
        username: res.data.username || '',
        fullName: res.data.fullName || '',
        email: res.data.email || ''
      });
      setForm({
        fullName: res.data.fullName || '',
        email: res.data.email || ''
      });
    } catch (err) {
      showSnackbar('Failed to fetch profile', 'error');
      setProfile({ id: null, username: '', fullName: '', email: '' });
      console.error('Profile fetch error:', err);
    }
  };

  const handleEditOpen = () => {
    setForm({ fullName: profile.fullName, email: profile.email });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/profile', {
        fullName: form.fullName,
        email: form.email
      });
      showSnackbar('Profile updated!', 'success');
      setProfile({ ...profile, fullName: form.fullName, email: form.email });
      setEditOpen(false);
    } catch {
      showSnackbar('Failed to update profile', 'error');
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
        position: 'relative',
      }}>
        <Box sx={{ position: 'absolute', top: 18, right: 18 }}>
          <IconButton onClick={handleEditOpen} size="large" aria-label="Edit Profile">
            <EditIcon fontSize="medium" />
          </IconButton>
        </Box>
        <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
          <PersonIcon sx={{ fontSize: 50 }} />
        </Avatar>
        <Typography variant="h4" mb={1} fontWeight={700} color="primary">Profile</Typography>
        <Box mt={2} width="100%">
          <Typography variant="subtitle1" color="text.secondary" fontWeight={600} mb={0.5}>Username</Typography>
          <Typography variant="body1" fontWeight={500} mb={1}>{profile.username || '-'}</Typography>
          <Typography variant="subtitle1" color="text.secondary" fontWeight={600} mb={0.5}>Full Name</Typography>
          <Typography variant="body1" fontWeight={500} mb={1}>{profile.fullName || '-'}</Typography>
          <Typography variant="subtitle1" color="text.secondary" fontWeight={600} mb={0.5}>Email</Typography>
          <Typography variant="body1" fontWeight={500}>{profile.email || '-'}</Typography>
        </Box>
      </Paper>
      <Dialog open={editOpen} onClose={handleEditClose} PaperProps={{ sx: { borderRadius: 4, p: 2, minWidth: 350 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24, pb: 0 }}>Edit Profile</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1, pb: 0 }}>
            {/* Username field removed from edit dialog */}
            <TextField label="Full Name" name="fullName" fullWidth margin="normal" value={form.fullName} onChange={handleChange} sx={{ borderRadius: 2 }} />
            <TextField label="Email" name="email" fullWidth margin="normal" value={form.email} onChange={handleChange} sx={{ borderRadius: 2 }} />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 1 }}>
            <Button onClick={handleEditClose} variant="outlined" size="large" sx={{ minWidth: 110, mr: 2, borderRadius: 2 }}>Cancel</Button>
            <Button type="submit" variant="contained" size="large" sx={{ minWidth: 110, borderRadius: 2, fontWeight: 600 }}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Profile; 