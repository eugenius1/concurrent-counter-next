"use client";

import { useState } from "react";
import { Box, Button, Container, Snackbar, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { useI18n } from "@/i18n/I18nProvider";
import LiveCounter from "./LiveCounter";
import Copyright from "./Copyright";

export default function CounterPage({
  id,
  initialValue,
}: {
  id: string;
  initialValue: string;
}) {
  const { m } = useI18n();
  const [notice, setNotice] = useState("");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice(m.linkCopied);
    } catch (error) {
      console.error("Error copying link:", error);
      setNotice(m.copyFailed);
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
        {m.anyoneWithLink}
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
          {m.share}
        </Button>
        <Button
          variant="outlined"
          onClick={copyLink}
          startIcon={<ContentCopyIcon />}
        >
          {m.copyLink}
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
