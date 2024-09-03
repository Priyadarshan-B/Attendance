import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const Popup = ({ open, onClose, onConfirm,title, text }) => {
  return (
    <Dialog fullWidth open={open} onClose={onClose} PaperProps={{
      style: {
        backgroundColor: 'var(--background-2)', // Background color for the popup
      }
    }}>
      <DialogTitle style={{ color: 'var(--text)' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ color: 'var(--text)' }}>
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          style={{ color: '#2c7cf3' }} 
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          style={{ color: '#2c7cf3' }} 
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog> 
  );
};

export default Popup;
