import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const InfoPopup = ({ open, onClose, onConfirm,title, text }) => {
  return (
    <Dialog fullWidth open={open} onClose={onClose} PaperProps={{
      style: {
        backgroundColor: 'var(--background-2)',
      }
    }}>
      <DialogTitle style={{ color: 'var(--text)' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ color: 'var(--text)' }}>
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {/*  */}
      </DialogActions>
    </Dialog> 
  );
};

export default InfoPopup;
