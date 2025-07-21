import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, TextField, Grid, Card, CardContent, CardActions, Button, CircularProgress, Rating, Snackbar } from '@mui/material';

const Books = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/books', { params: search ? { title: search } : {} });
      setBooks(res.data);
    } catch (err) {
      setError('Failed to load books');
    }
    setLoading(false);
  };

  const handleBorrow = async (bookId) => {
    try {
      await axios.post(`/api/loans/borrow/${bookId}`);
      setSnackbar('Book borrowed!');
    } catch {
      setSnackbar('Failed to borrow book');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4">Books</Typography>
      <TextField
        label="Search by title"
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ my: 2 }}
      />
      {loading ? <CircularProgress /> : error ? <Typography color="error">{error}</Typography> : (
        <Grid container spacing={2}>
          {books.map(book => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{book.title}</Typography>
                  <Typography variant="body2">Author: {book.author}</Typography>
                  <Typography variant="body2">Publisher: {book.publisher}</Typography>
                  <Typography variant="body2">Available: {book.availableCopies} / {book.totalCopies}</Typography>
                  {/* Ratings and more details can be added here */}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleBorrow(book.id)} disabled={book.availableCopies < 1}>Borrow</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
};

export default Books; 