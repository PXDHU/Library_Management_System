import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  InputAdornment,
  Fade,
  CardMedia,
  Rating,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import BarcodeIcon from '@mui/icons-material/QrCode2';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import Pagination from '@mui/material/Pagination';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from '../context/SnackbarContext';
import BorrowDialog from '../components/BorrowDialog';

export let refetchAverageRatings = () => {};

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const booksPerPage = 8; // 4 columns x 2 rows on desktop
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [borrowDays, setBorrowDays] = useState('2');
  const [borrowBookId, setBorrowBookId] = useState(null);
  const [borrowAvailableCopies, setBorrowAvailableCopies] = useState(null);
  const [averageRatings, setAverageRatings] = useState({});

  // Calculate paginated books
  const pageCount = Math.ceil(filteredBooks.length / booksPerPage);
  const paginatedBooks = filteredBooks.slice((page - 1) * booksPerPage, page * booksPerPage);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books');
        setBooks(response.data);
        setFilteredBooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        showSnackbar('Failed to fetch books.', 'error');
        setLoading(false);
      }
    };
    const fetchAverageRatings = async () => {
      try {
        const response = await axios.get('/api/ratings/averages');
        setAverageRatings(response.data);
      } catch (error) {
        console.error('Failed to fetch average ratings', error);
      }
    };
    refetchAverageRatings = fetchAverageRatings;
    fetchBooks();
    fetchAverageRatings();
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.publisher.toLowerCase().includes(lowerQuery) ||
        book.isbn.toLowerCase().includes(lowerQuery)
    );
    setFilteredBooks(filtered);
  }, [books]);

  const handleFavoriteToggle = (bookId) => {
    const isFav = favorites.includes(bookId);
    const updatedFavs = isFav ? favorites.filter(id => id !== bookId) : [...favorites, bookId];
    setFavorites(updatedFavs);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const BookCard = ({ book }) => {
    const avgRating = averageRatings[book.id] || 0;
    return (
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
            value={avgRating}
            precision={0.1}
            readOnly
            size="small"
            sx={{ mt: 1, color: 'primary.main' }}
          />
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button fullWidth variant="contained" color="primary"
            onClick={() => openBorrowDialog(book.id, book.availableCopies)}
            disabled={!user || !book.availableCopies || book.availableCopies < 1}
          >
            Borrow Book
          </Button>
        </CardActions>
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            cursor: 'pointer',
            zIndex: 1,
          }}
          onClick={() => handleFavoriteToggle(book.id)}
        >
          {favorites.includes(book.id) ? (
            <FavoriteIcon sx={{ color: '#b91c1c' }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: '#bfc0c0' }} />
          )}
        </Box>
      </Card>
    );
  };

  return (
    <Box p={3}>
      <Box mb={4} textAlign="center" display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" gutterBottom color="primary.main" fontWeight={600} letterSpacing={0}>
          Book Catalog
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Browse and borrow from a wide selection of books
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: 600 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in timeout={500}>
          <Box>
            <Grid container spacing={3} justifyContent="center">
              {paginatedBooks.map((book) => (
                <Grid item key={book.id} xs={12} sm={6} md={4} lg={3} display="flex" justifyContent="center">
                  <BookCard book={book} />
                </Grid>
              ))}
            </Grid>
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          </Box>
        </Fade>
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

export default BookCatalog;
