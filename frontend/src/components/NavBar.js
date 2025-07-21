import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} component={Link} to="/" color="inherit" style={{ textDecoration: 'none' }}>
          Library System
        </Typography>
        {user && (
          <>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
            <Button color="inherit" component={Link} to="/books">Books</Button>
            <Button color="inherit" component={Link} to="/loans">Loans</Button>
            <Button color="inherit" component={Link} to="/profile">Profile</Button>
            {user.role === 'ROLE_ADMIN' && <Button color="inherit" component={Link} to="/admin">Admin</Button>}
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </>
        )}
        {!user && <Button color="inherit" component={Link} to="/login">Login</Button>}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 