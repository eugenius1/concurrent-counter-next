"use client";

import { useState } from "react";
import { Box, Button, Container, Snackbar, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import LiveCounter from "./LiveCounter";
import Copyright from "./Copyright";

export default function CounterPage({
  id,
  initialValue,
}: {
  id: string;
  initialValue: number;
}) {
  const [notice, setNotice] = useState("");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("Link copied");
    } catch (error) {
      console.error("Error copying link:", error);
      setNotice("Couldn't copy the link. Copy it from the address bar instead.");
    }
  };

  const shareLink = async () => {
    // Not every browser has a share sheet; copying is the next best thing
    if (typeof navigator.share !== "function") return copyLink();
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } catch {
      // Dismissing the share sheet rejects too; there is nothing to report
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <LiveCounter id={id} initialValue={initialValue} />

      <Typography align="center" sx={{ mt: 4, mb: 2, color: "text.secondary" }}>
        Anyone with the link to this page can see and change this counter.
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={shareLink}
          startIcon={<ShareIcon />}
        >
          Share
        </Button>
        <Button
          variant="outlined"
          onClick={copyLink}
          startIcon={<ContentCopyIcon />}
        >
          Copy link
        </Button>
      </Box>

      <Snackbar
        open={notice !== ""}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setNotice("")}
        message={notice}
      />

      <Box sx={{ mt: 8, mb: 4 }}>
        <Copyright />
      </Box>
    </Container>
  );
}
