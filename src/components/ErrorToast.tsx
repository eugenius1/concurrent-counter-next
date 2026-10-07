import { useState } from "react";
import { Alert, Snackbar } from "@mui/material";

/** A failure to tell the user about; an empty message hides it. */
export default function ErrorToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  // The text stays while the toast fades out, after the message is cleared
  const [shown, setShown] = useState(message);
  if (message && message !== shown) setShown(message);

  return (
    <Snackbar
      open={message !== ""}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      // Pressing the button again is a click away, and must not dismiss the
      // error that press is about to cause
      onClose={(_, reason) => {
        if (reason !== "clickaway") onClose();
      }}
    >
      <Alert severity="error" variant="filled" onClose={onClose}>
        {shown}
      </Alert>
    </Snackbar>
  );
}
