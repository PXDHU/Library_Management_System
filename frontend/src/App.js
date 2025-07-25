import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './routes/ProtectedRoute';
import PopularBooks from './pages/PopularBooks';
import RecommendedBooks from './pages/RecommendedBooks';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import Loans from './pages/Loans';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { SnackbarProvider } from './context/SnackbarContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <Router>
            <NavBar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><PopularBooks /></ProtectedRoute>} />
              <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
              <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/popular" element={<ProtectedRoute><PopularBooks /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><RecommendedBooks /></ProtectedRoute>} />

              {/* Redirect root to popular books */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
