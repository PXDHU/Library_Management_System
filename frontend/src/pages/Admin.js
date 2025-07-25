import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Avatar,
  TablePagination,
  TextField,
  InputAdornment,
  Fade,
  useTheme,
  Modal,
  Button,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useSnackbar } from '../context/SnackbarContext';

const Admin = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(0);
  const [bookPage, setBookPage] = useState(0);
  const [loanPage, setLoanPage] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [loanSearch, setLoanSearch] = useState('');
  const rowsPerPage = 5;
  const [editBook, setEditBook] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addBookModalOpen, setAddBookModalOpen] = useState(false);
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const { showSnackbar } = useSnackbar();

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
      setFilteredUsers(usersRes.data); // Initialize filtered state
      setFilteredBooks(booksRes.data); // Initialize filtered state
      setFilteredLoans(loansRes.data); // Initialize filtered state
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to fetch admin data', 'error');
    }
    setLoading(false);
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`/api/books/${id}`);
      fetchAll();
      showSnackbar('Book deleted successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to delete book. User has not returned the book yet.', 'error');
    }
  };

  const handleEditBook = (book) => {
    setEditBook(book);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditBook(null);
  };

  function isValidISBN(isbn) {
    return /^(\d{10}|\d{13})$/.test(isbn);
  }
  function isValidYear(year) {
    const y = Number(year);
    const currentYear = new Date().getFullYear();
    return /^\d{4}$/.test(year) && y >= 1000 && y <= currentYear;
  }

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    setEditError("");
    const data = new FormData(e.currentTarget);
    const isbn = data.get('isbn');
    const year = data.get('year');
    if (!isValidISBN(isbn)) {
      setEditError("ISBN must be 10 or 13 digits.");
      return;
    }
    if (!isValidYear(year)) {
      setEditError("Year must be a 4-digit number between 1000 and the current year.");
      return;
    }
    const updatedBook = {
      title: data.get('title'),
      author: data.get('author'),
      isbn: data.get('isbn'),
      year: Number(data.get('year')),
      publisher: data.get('publisher'),
      totalCopies: Number(data.get('totalCopies')),
    };
    try {
      await axios.put(`/api/admin/books/${editBook.id}`, updatedBook);
      fetchAll();
      handleEditModalClose();
      showSnackbar('Book updated successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to update book', 'error');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setAddError("");
    const data = new FormData(e.currentTarget);
    const isbn = data.get('isbn');
    const year = data.get('year');
    if (!isValidISBN(isbn)) {
      setAddError("ISBN must be 10 or 13 digits.");
      return;
    }
    if (!isValidYear(year)) {
      setAddError("Year must be a 4-digit number between 1000 and the current year.");
      return;
    }
    const book = {
      title: data.get('title'),
      author: data.get('author'),
      isbn: data.get('isbn'),
      year: Number(data.get('year')),
      publisher: data.get('publisher'),
      totalCopies: Number(data.get('totalCopies')),
      availableCopies: Number(data.get('totalCopies')),
    };
    try {
      await axios.post('/api/admin/books', book);
      fetchAll();
      setAddBookModalOpen(false);
      showSnackbar('Book added successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to add book', 'error');
    }
  };

  // Filter Functions
  const filterUsers = (query) => {
    const filtered = users.filter(user =>
      user.username?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase()) ||
      user.role?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const filterBooks = (query) => {
    const filtered = books.filter(book =>
      book.title?.toLowerCase().includes(query.toLowerCase()) ||
      book.author?.toLowerCase().includes(query.toLowerCase()) ||
      book.publisher?.toLowerCase().includes(query.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const filterLoans = (query) => {
    const filtered = loans.filter(loan =>
      loan.book?.title?.toLowerCase().includes(query.toLowerCase()) ||
      loan.user?.username?.toLowerCase().includes(query.toLowerCase()) ||
      loan.id?.toString().includes(query)
    );
    setFilteredLoans(filtered);
  };

  // Search Handlers
  const handleUserSearchChange = (e) => {
    const query = e.target.value;
    setUserSearch(query);
    filterUsers(query);
    setUserPage(0);
  };

  const handleBookSearchChange = (e) => {
    const query = e.target.value;
    setBookSearch(query);
    filterBooks(query);
    setBookPage(0);
  };

  const handleLoanSearchChange = (e) => {
    const query = e.target.value;
    setLoanSearch(query);
    filterLoans(query);
    setLoanPage(0);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card
      sx={{
        width: '100%',
        maxWidth: 360,
        height: 160,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 4,
        boxShadow: '0 1.5px 8px 0 rgba(60,72,88,0.06)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px 0 rgba(60,72,88,0.10)'
        }
      }}
    >
      <CardContent sx={{ p: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Avatar sx={{ bgcolor: '#f7f7fa', color: color, width: 48, height: 48, border: '1px solid #e5e7eb', mb: 1 }}>
          <Icon fontSize="large" />
        </Avatar>
        <Typography variant="h4" fontWeight={600} color="primary.main" sx={{ mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="h6" color="text.primary" fontWeight={500} sx={{ fontSize: 16, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 13 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const EnhancedTable = ({ title, data, columns, page, onPageChange, icon: Icon, onAddBook }) => (
    <Paper
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 1.5px 8px 0 rgba(60,72,88,0.06)',
        border: '1px solid #e5e7eb',
        background: '#fff',
        mb: 2,
        width: '100%'
      }}
    >
      <Box sx={{
        p: 3,
        background: '#f7f7fa',
        color: 'primary.main',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Icon color="primary" />
            <Typography variant="h6" fontWeight={600} color="primary.main">
              {title}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            {title === "Books" && onAddBook && (
              <Button variant="contained" color="primary" onClick={onAddBook}>
                Add Book
              </Button>
            )}
            {/* Search box removed */}
          </Box>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx} sx={{ fontWeight: 600, background: '#f7f7fa', borderBottom: '1px solid #e5e7eb' }}>{col.headerName}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
              <TableRow key={row.id || idx}>
                {columns.map((col, cidx) => (
                  <TableCell key={cidx}>
                    {col.render ? col.render(row) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
      />
    </Paper>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading admin dashboard...
        </Typography>
      </Box>
    );
  }

  const userColumns = [
    { field: 'id', headerName: 'ID' },
    { field: 'username', headerName: 'Username' },
    { field: 'email', headerName: 'Email' },
    {
      field: 'role',
      headerName: 'Role',
      render: (row) => (
        <Chip
          label={row.role}
          color={row.role === 'admin' ? 'error' : 'primary'}
          size="small"
          variant="outlined"
        />
      )
    }
  ];

  const bookColumns = [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    { field: 'author', headerName: 'Author' },
    {
      field: 'availability',
      headerName: 'Available',
      render: (row) => (
        <Chip
          label={`${row.availableCopies} / ${row.totalCopies}`}
          color={row.availableCopies > 0 ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (row) => (
        <>
          <IconButton onClick={() => handleEditBook(row)} color="primary" size="small" style={{ marginRight: 8 }}>
            <EditIcon />
          </IconButton>
          <button
            style={{
              background: '#e53935',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => handleDeleteBook(row.id)}
          >
            Delete
          </button>
        </>
      )
    }
  ];

  const loanColumns = [
    { field: 'id', headerName: 'ID' },
    { field: 'book.title', headerName: 'Book', render: (row) => row.book?.title },
    { field: 'user.username', headerName: 'User', render: (row) => row.user?.username },
    { field: 'dueDate', headerName: 'Due Date', render: (row) => row.dueDate?.slice(0, 10) },
    {
      field: 'status',
      headerName: 'Status',
      render: (row) => (
        <Chip
          label={row.returnDate ? 'Returned' : 'Active'}
          color={row.returnDate ? 'success' : 'warning'}
          size="small"
        />
      )
    }
  ];

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ p: { xs: 1, sm: 4 }, backgroundColor: 'transparent', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box mb={4} textAlign="center">
          <Typography
            variant="h3"
            fontWeight={600}
            color="primary.main"
            sx={{ mb: 1 }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your library system with comprehensive insights
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'stretch',
            gap: 3,
            mb: 5,
            width: '100%',
            maxWidth: 1100,
            mx: 'auto',
            flexWrap: 'nowrap',
          }}
        >
          <StatCard
            title="Total Users"
            value={users.length}
            icon={PersonIcon}
            color={'#3a5a80'}
            subtitle="Registered members"
          />
          <StatCard
            title="Total Books"
            value={books.length}
            icon={BookIcon}
            color={'#2e7d32'}
            subtitle="In collection"
          />
          <StatCard
            title="Active Loans"
            value={loans.filter(l => !l.returnDate).length}
            icon={AssignmentIcon}
            color={'#ed6c02'}
            subtitle="Currently borrowed"
          />
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" width="100%" maxWidth="1100px" mx="auto">
          <EnhancedTable
            title="Users"
            data={filteredUsers}
            columns={userColumns}
            page={userPage}
            onPageChange={setUserPage}
            icon={PersonIcon}
          />
          <Box mt={4} width="100%">
            <EnhancedTable
              title="Books"
              data={filteredBooks}
              columns={bookColumns}
              page={bookPage}
              onPageChange={setBookPage}
              icon={BookIcon}
              onAddBook={() => setAddBookModalOpen(true)}
            />
          </Box>
          <Box mt={4} width="100%">
            <EnhancedTable
              title="Loans"
              data={filteredLoans}
              columns={loanColumns}
              page={loanPage}
              onPageChange={setLoanPage}
              icon={AssignmentIcon}
            />
          </Box>
        </Box>
        <Modal open={editModalOpen} onClose={handleEditModalClose}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #e5e7eb',
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
          }}>
            <Typography variant="h6" mb={2}>Edit Book</Typography>
            {editBook && (
              <Box component="form" onSubmit={handleUpdateBook} display="flex" flexDirection="column" gap={2}>
                {editError && <Typography color="error" sx={{ width: '100%' }}>{editError}</Typography>}
                <TextField name="title" label="Title" defaultValue={editBook.title} required />
                <TextField name="author" label="Author" defaultValue={editBook.author} required />
                <TextField name="isbn" label="ISBN" defaultValue={editBook.isbn} required />
                <TextField name="year" label="Year" type="number" defaultValue={editBook.year} required />
                <TextField name="publisher" label="Publisher" defaultValue={editBook.publisher} required />
                <TextField name="totalCopies" label="Total Copies" type="number" defaultValue={editBook.totalCopies} required />
                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <Button onClick={handleEditModalClose} color="secondary" variant="outlined">Cancel</Button>
                  <Button type="submit" color="primary" variant="contained">Save</Button>
                </Box>
              </Box>
            )}
          </Box>
        </Modal>
        <Modal open={addBookModalOpen} onClose={() => setAddBookModalOpen(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #e5e7eb',
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
          }}>
            <Typography variant="h6" mb={2}>Add New Book</Typography>
            <Box component="form" onSubmit={handleAddBook} display="flex" flexDirection="column" gap={2}>
              {addError && <Typography color="error" sx={{ width: '100%' }}>{addError}</Typography>}
              <TextField name="title" label="Title" required />
              <TextField name="author" label="Author" required />
              <TextField name="isbn" label="ISBN" required />
              <TextField name="year" label="Year" type="number" required />
              <TextField name="publisher" label="Publisher" required />
              <TextField name="totalCopies" label="Total Copies" type="number" required />
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button onClick={() => setAddBookModalOpen(false)} color="secondary" variant="outlined">Cancel</Button>
                <Button type="submit" color="primary" variant="contained">Add</Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Fade>
  );
};

export default Admin;