import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@mui/material';

const BorrowDialog = ({
  open,
  onClose,
  borrowDays,
  setBorrowDays,
  handleConfirmBorrow
}) => (
  <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 2, minWidth: 350 } }}>
    <DialogTitle sx={{ fontWeight: 700, fontSize: 24, pb: 0 }}>Borrow Book</DialogTitle>
    <Typography variant="subtitle1" color="text.secondary" sx={{ px: 3, pt: 1, pb: 0.5 }}>
      Please enter the number of days you wish to borrow this book for.
    </Typography>
    <DialogContent sx={{ pt: 1, pb: 0 }}>
      <TextField
        autoFocus
        margin="dense"
        label="Number of days"
        type="number"
        fullWidth
        size="large"
        value={borrowDays}
        onChange={e => setBorrowDays(e.target.value)}
        inputProps={{ min: 1, style: { fontSize: 18, padding: '14px 10px' } }}
        helperText="Enter a value between 1 and 30 days."
        FormHelperTextProps={{ sx: { fontSize: 14 } }}
        sx={{ mt: 2, mb: 1 }}
      />
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 1 }}>
      <Button onClick={onClose} variant="outlined" size="large" sx={{ minWidth: 110, mr: 2, borderRadius: 2 }}>Cancel</Button>
      <Button onClick={handleConfirmBorrow} variant="contained" size="large" sx={{ minWidth: 110, borderRadius: 2 }}>Borrow</Button>
    </DialogActions>
  </Dialog>
);

export default BorrowDialog; 