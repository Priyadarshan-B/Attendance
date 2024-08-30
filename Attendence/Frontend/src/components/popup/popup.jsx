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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          style={{ color: 'black' }} 
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          style={{ color: 'blue' }} 
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog> 
  );
};

export default Popup;
