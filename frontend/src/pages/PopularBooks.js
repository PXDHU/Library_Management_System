import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, Snackbar, Tooltip, Chip, CardMedia, Rating } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import BarcodeIcon from '@mui/icons-material/QrCode2';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BorrowDialog from '../components/BorrowDialog';

const PopularBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [borrowDays, setBorrowDays] = useState('2');
  const [borrowBookId, setBorrowBookId] = useState(null);
  const [borrowAvailableCopies, setBorrowAvailableCopies] = useState(null);

  const openBorrowDialog = (bookId, availableCopies) => {
    setBorrowBookId(bookId);
    setBorrowAvailableCopies(availableCopies);
    setBorrowDays('2');
    setBorrowDialogOpen(true);
  };
  const closeBorrowDialog = () => {
    setBorrowDialogOpen(false);
    setBorrowBookId(null);
    setBorrowAvailableCopies(null);
  };
  const handleConfirmBorrow = async () => {
    if (!user) {
      showSnackbar('Please log in to borrow books.', 'warning');
      closeBorrowDialog();
      return;
    }
    if (!borrowAvailableCopies || borrowAvailableCopies < 1) {
      showSnackbar('No copies available to borrow.', 'warning');
      closeBorrowDialog();
      return;
    }
    if (!borrowDays || isNaN(borrowDays) || borrowDays <= 0) {
      showSnackbar('Please enter a valid number of days.', 'warning');
      return;
    }
    try {
      await axios.post(`/api/loans/borrow/${borrowBookId}?durationDays=${borrowDays}`);
      showSnackbar('Book borrowed!', 'success');
      closeBorrowDialog();
    } catch (err) {
      showSnackbar('Failed to borrow book.', 'error');
      closeBorrowDialog();
    }
  };

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const res = await axios.get('/api/books/popular');
        const titles = res.data;
        // Fetch full book details for each title using Promise.allSettled
        const bookDetailsResults = await Promise.allSettled(
          titles.map(async (title) => {
            const resp = await axios.get(`/api/books?title=${encodeURIComponent(title)}`);
            return resp.data && resp.data.length > 0 ? resp.data[0] : null;
          })
        );
        const bookDetails = bookDetailsResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value);
        setBooks(bookDetails);
        if (bookDetails.length === 0) {
          showSnackbar('Failed to fetch popular books', 'error');
        }
      } catch (err) {
        showSnackbar('Fetched popular books', 'success');
      }
      setLoading(false);
    };
    fetchPopularBooks();
  }, [showSnackbar]);

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
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button fullWidth variant="contained" color="primary" sx={{ fontWeight: 500, borderRadius: 3 }}
                    onClick={() => openBorrowDialog(book.id, book.availableCopies)}
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
      {/* Borrow Dialog */}
      <BorrowDialog
        open={borrowDialogOpen}
        onClose={closeBorrowDialog}
        borrowDays={borrowDays}
        setBorrowDays={setBorrowDays}
        handleConfirmBorrow={handleConfirmBorrow}
      />
    </Box>
  );
};

export default PopularBooks;
