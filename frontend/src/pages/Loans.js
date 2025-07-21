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
    <Box p={3}>
      <Typography variant="h4">My Loans</Typography>
      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {loans.map(loan => (
            <Grid item xs={12} sm={6} md={4} key={loan.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{loan.book?.title}</Typography>
                  <Typography variant="body2">Due: {loan.dueDate?.slice(0, 10)}</Typography>
                  <Typography variant="body2">Returned: {loan.returnDate ? loan.returnDate.slice(0, 10) : 'No'}</Typography>
                </CardContent>
                <CardActions>
                  {!loan.returnDate && <Button size="small" onClick={() => handleReturn(loan.id)}>Return</Button>}
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