"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import NextLink from "next/link";
import { Box, Button, Container, Snackbar, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import Counter from "./Counter";
import Copyright from "./Copyright";

const subscribeToNothing = () => () => {};

export default function CounterPage({
  id,
  initialValue,
}: {
  id: string;
  initialValue: number;
}) {
  const [value, setValue] = useState(initialValue);
  const [notice, setNotice] = useState("");
  // The share sheet exists mostly on phones; read on the client only, so the
  // server-rendered page and the first client render agree
  const canShare = useSyncExternalStore(
    subscribeToNothing,
    () => typeof navigator.share === "function",
    () => false,
  );

  useEffect(() => {
    // The stream sends the current value first, then every change.
    // EventSource reconnects on its own and receives the current value again.
    const events = new EventSource(`/api/counters/${id}/stream`);

    events.addEventListener("change", (event) => {
      setValue(JSON.parse(event.data).value);
    });

    return () => {
      events.close();
    };
  }, [id]);

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
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Concurrent Counter
      </Typography>

      <Counter id={id} value={value} />

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
          onClick={copyLink}
          startIcon={<ContentCopyIcon />}
        >
          Copy link
        </Button>
        {canShare && (
          <Button
            variant="outlined"
            onClick={shareLink}
            startIcon={<ShareIcon />}
          >
            Share
          </Button>
        )}
        <Button component={NextLink} href="/">
          Home
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
