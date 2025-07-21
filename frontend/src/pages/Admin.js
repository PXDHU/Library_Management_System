import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, booksRes, loansRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/books'),
        axios.get('/api/admin/loans'),
      ]);
      setUsers(usersRes.data);
      setBooks(booksRes.data);
      setLoans(loansRes.data);
    } catch {}
    setLoading(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4">Admin Panel</Typography>
      {loading ? <CircularProgress /> : (
        <>
          <Typography variant="h6" mt={3}>Users</Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6">Books</Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Available</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>{b.author}</TableCell>
                    <TableCell>{b.availableCopies} / {b.totalCopies}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6">Active Loans</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Book</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Returned</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{l.id}</TableCell>
                    <TableCell>{l.book?.title}</TableCell>
                    <TableCell>{l.user?.username}</TableCell>
                    <TableCell>{l.dueDate?.slice(0, 10)}</TableCell>
                    <TableCell>{l.returnDate ? l.returnDate.slice(0, 10) : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default Admin; 