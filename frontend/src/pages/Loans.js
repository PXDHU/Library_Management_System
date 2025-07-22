import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, Snackbar } from '@mui/material';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/loans/my');
      setLoans(res.data);
    } catch {
      setLoans([]);
    }
    setLoading(false);
  };

  const handleReturn = async (loanId) => {
    try {
      await axios.post(`/api/loans/return/${loanId}`);
      setSnackbar('Book returned!');
      fetchLoans();
    } catch {
      setSnackbar('Failed to return book');
    }
  };

  return (
    <Box p={{ xs: 1, sm: 3 }} display="flex" flexDirection="column" alignItems="center" minHeight="80vh">
      <Typography variant="h4" fontWeight={600} color="primary.main" mb={3} letterSpacing={0} textAlign="center">My Loans</Typography>
      {loading ? <CircularProgress /> : (
        <Grid container spacing={3} justifyContent="center">
          {loans.map(loan => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={loan.id} display="flex" justifyContent="center">
              <Card sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 1.5px 8px 0 rgba(60,72,88,0.06)', border: '1px solid #e5e7eb', width: 270, m: 1, p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>{loan.book?.title}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={400}>Due: {loan.dueDate?.slice(0, 10)}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={400}>Returned: {loan.returnDate ? loan.returnDate.slice(0, 10) : 'No'}</Typography>
                </CardContent>
                <CardActions>
                  {!loan.returnDate && <Button size="small" onClick={() => handleReturn(loan.id)} sx={{ fontWeight: 500, borderRadius: 3, color: 'primary.main', border: '1px solid #3a5a80', background: 'none', '&:hover': { background: '#f7f7fa', color: 'primary.dark' } }}>Return</Button>}
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

export default Loans; 