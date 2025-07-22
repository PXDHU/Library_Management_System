import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, Snackbar, Tooltip, Chip, CardMedia, Rating } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import BarcodeIcon from '@mui/icons-material/QrCode2';
import Inventory2Icon from '@mui/icons-material/Inventory2';

const PopularBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const res = await axios.get('/api/books/popular');
        const titles = res.data;
        // Fetch full book details for each title
        const bookDetails = await Promise.all(
          titles.map(async (title) => {
            const resp = await axios.get(`/api/books?title=${encodeURIComponent(title)}`);
            // If multiple books match, take the first
            return resp.data && resp.data.length > 0 ? resp.data[0] : null;
          })
        );
        setBooks(bookDetails.filter(Boolean));
      } catch (err) {
        setSnackbar('Failed to fetch popular books');
      }
      setLoading(false);
    };
    fetchPopularBooks();
  }, []);

  const handleBorrow = async (bookId, availableCopies) => {
    if (!user) {
      setSnackbar('Please log in to borrow books.');
      return;
    }
    if (!availableCopies || availableCopies < 1) {
      setSnackbar('No copies available to borrow.');
      return;
    }
    try {
      await axios.post(`/api/loans/borrow/${bookId}`);
      setSnackbar('Book borrowed!');
    } catch (err) {
      setSnackbar('Failed to borrow book.');
    }
  };

  return (
    <Box p={{ xs: 1, sm: 3 }} display="flex" flexDirection="column" alignItems="center" minHeight="80vh">
      <Typography variant="h4" fontWeight={600} color="primary.main" mb={3} textAlign="center">
        Popular Books
      </Typography>
      {loading ? <CircularProgress /> : (
        <Grid container spacing={3} justifyContent="center">
          {books.map((book, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id || index} display="flex" justifyContent="center">
              <Card
                sx={{
                  width: 270,
                  height: 420,
                  m: 1,
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 4,
                  boxShadow: 1,
                  position: 'relative',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.01)',
                    boxShadow: 2,
                  },
                }}
              >
                <Box sx={{ background: '#f7f7fa', p: 2, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                  <CardMedia
                    component="div"
                    sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a5a80', fontSize: 40 }}
                  >
                    📖
                  </CardMedia>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Tooltip title={book.title} arrow>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        color: 'primary.main',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textShadow: 'none',
                      }}
                    >
                      {book.title}
                    </Typography>
                  </Tooltip>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
                    <PersonIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {book.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
                    <BusinessIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {book.publisher}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
                    <BarcodeIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    ISBN: {book.isbn}
                  </Typography>
                  <Chip
                    icon={<Inventory2Icon />}
                    label={`${book.availableCopies} / ${book.totalCopies} available`}
                    color={book.availableCopies > 0 ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 1, fontWeight: 500, background: '#f7f7fa', color: 'primary.main' }}
                  />
                  <Rating
                    value={typeof book.rating === 'number' ? book.rating : 0}
                    readOnly
                    size="small"
                    sx={{ mt: 1, color: 'primary.main' }}
                  />
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button fullWidth variant="contained" color="primary" sx={{ fontWeight: 500, borderRadius: 3 }}
                    onClick={() => handleBorrow(book.id, book.availableCopies)}
                    disabled={!user || !book.availableCopies || book.availableCopies < 1}
                  >
                    Borrow Book
                  </Button>
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

export default PopularBooks;
