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
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  TablePagination,
  TextField,
  InputAdornment,
  Fade,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const Admin = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(0);
  const [bookPage, setBookPage] = useState(0);
  const [loanPage, setLoanPage] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const rowsPerPage = 5;

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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author?.toLowerCase().includes(bookSearch.toLowerCase())
  );

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

  const EnhancedTable = ({ title, data, columns, searchValue, onSearchChange, page, onPageChange, icon: Icon }) => (
    <Paper
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 1.5px 8px 0 rgba(60,72,88,0.06)',
        border: '1px solid #e5e7eb',
        background: '#fff',
        mb: 2
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
          <TextField
            size="small"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              background: '#fff',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fff',
                borderRadius: 2,
                '& fieldset': { border: '1px solid #e5e7eb' },
                '&:hover fieldset': { border: '1px solid #3a5a80' },
                '&.Mui-focused fieldset': { border: '2px solid #3a5a80' }
              },
              '& .MuiInputBase-input': { color: 'primary.main' },
              '& .MuiInputBase-input::placeholder': { color: '#bfc0c0' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#bfc0c0' }} />
                </InputAdornment>
              ),
            }}
          />
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

        {/* StatCards Row - perfectly centered horizontally */}
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
          <StatCard
            title="Total Loans"
            value={loans.length}
            icon={TrendingUpIcon}
            color={'#0288d1'}
            subtitle="All time"
          />
        </Box>

        {/* EnhancedTables Vertical Stack - perfectly centered vertically */}
        <Box display="flex" flexDirection="column" alignItems="center" width="100%" maxWidth="1100px" mx="auto">
          <EnhancedTable
            title="Users"
            data={filteredUsers}
            columns={userColumns}
            searchValue={userSearch}
            onSearchChange={setUserSearch}
            page={userPage}
            onPageChange={setUserPage}
            icon={PersonIcon}
          />
          <Box mt={4} width="100%">
            {/* Add Book Form */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: '0 1.5px 8px 0 rgba(60,72,88,0.06)', border: '1px solid #e5e7eb', background: '#fff' }}>
              <Typography variant="h6" fontWeight={600} color="primary.main" mb={2}>Add New Book</Typography>
              <Box component="form" display="flex" flexWrap="wrap" gap={2} onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
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
                  e.target.reset();
                } catch (err) {
                  alert('Failed to add book');
                }
              }}>
                <TextField name="title" label="Title" required sx={{ flex: 1, minWidth: 180 }} />
                <TextField name="author" label="Author" required sx={{ flex: 1, minWidth: 180 }} />
                <TextField name="isbn" label="ISBN" required sx={{ flex: 1, minWidth: 140 }} />
                <TextField name="year" label="Year" type="number" required sx={{ flex: 1, minWidth: 100 }} />
                <TextField name="publisher" label="Publisher" required sx={{ flex: 1, minWidth: 180 }} />
                <TextField name="totalCopies" label="Total Copies" type="number" required sx={{ flex: 1, minWidth: 120 }} />
                <Box display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
                  <button type="submit" style={{
                    background: theme.palette.primary.main,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: 'none',
                  }}>Add Book</button>
                </Box>
              </Box>
            </Paper>
            <EnhancedTable
              title="Books"
              data={filteredBooks}
              columns={bookColumns}
              searchValue={bookSearch}
              onSearchChange={setBookSearch}
              page={bookPage}
              onPageChange={setBookPage}
              icon={BookIcon}
            />
          </Box>
          <Box mt={4} width="100%">
            <EnhancedTable
              title="Loans"
              data={loans}
              columns={loanColumns}
              searchValue=""
              onSearchChange={() => {}}
              page={loanPage}
              onPageChange={setLoanPage}
              icon={AssignmentIcon}
            />
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default Admin;
