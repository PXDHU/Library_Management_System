import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: '#fff',
        boxShadow: '0 1px 4px 0 rgba(60,72,88,0.04)',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        mt: 2,
        mx: 'auto',
        maxWidth: 1200,
        width: '98%',
        backdropFilter: 'none',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 1, sm: 3 } }}>
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: 1,
            color: 'primary.main',
            textDecoration: 'none',
            background: 'unset',
            cursor: 'pointer',
            fontFamily: 'Inter, Roboto, Helvetica Neue, Arial, sans-serif',
          }}
          component={Link}
          to="/"
        >
          Library System
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {user && (
            <>
              <Button color="primary" component={Link} to="/books" sx={{ fontWeight: 500, borderRadius: 3, px: 2, background: 'none', color: 'primary.main', '&:hover': { background: '#f7f7fa', color: 'primary.dark' } }}>Books</Button>
              <Button color="primary" component={Link} to="/recommendations" sx={{ fontWeight: 500, borderRadius: 3, px: 2, background: 'none', color: 'primary.main', '&:hover': { background: '#f7f7fa', color: 'primary.dark' } }}>Recommendations</Button>
              <Button color="primary" component={Link} to="/loans" sx={{ fontWeight: 500, borderRadius: 3, px: 2, background: 'none', color: 'primary.main', '&:hover': { background: '#f7f7fa', color: 'primary.dark' } }}>Loans</Button>
              <Button color="primary" component={Link} to="/profile" sx={{ fontWeight: 500, borderRadius: 3, px: 2, background: 'none', color: 'primary.main', '&:hover': { background: '#f7f7fa', color: 'primary.dark' } }}>Profile</Button>
              {user.role === 'ROLE_ADMIN' && (
                <Button color="primary" component={Link} to="/admin" sx={{ fontWeight: 500, borderRadius: 3, px: 2, background: 'none', color: 'primary.main', '&:hover': { background: '#f7f7fa', color: 'primary.dark' } }}>Admin</Button>
              )}
              <Button color="primary" onClick={handleLogout} sx={{ fontWeight: 500, borderRadius: 3, px: 2, background: 'none', color: '#b91c1c', '&:hover': { background: '#f7f7fa', color: '#fff', backgroundColor: '#b91c1c' } }}>Logout</Button>
            </>
          )}
          {!user && (
            location.pathname === '/login' ? (
              <Button color="primary" component={Link} to="/register" sx={{ fontWeight: 500, borderRadius: 3, px: 2, background: 'none', color: 'primary.main', '&:hover': { background: '#f7f7fa', color: 'primary.dark' } }}>Register</Button>
            ) : (
              <Button color="primary" component={Link} to="/login" sx={{ fontWeight: 500, borderRadius: 3, px: 2, background: 'none', color: 'primary.main', '&:hover': { background: '#f7f7fa', color: 'primary.dark' } }}>Login</Button>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
