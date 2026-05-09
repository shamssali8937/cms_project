import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function NotificationAlert({
  open,
  message,
  onClose,
  severity = "success",
}) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={open}
      onClose={onClose}
      autoHideDuration={3000}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled" 
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}