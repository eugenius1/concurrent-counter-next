"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Button, Typography, Box } from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import Copyright from "../components/Copyright";
import ErrorToast from "../components/ErrorToast";
import LiveCounter from "../components/LiveCounter";
import { DEMO_COUNTER_ID } from "../lib/demoCounter";
import { plural } from "@/i18n/format";
import { useI18n } from "@/i18n/I18nProvider";

export default function Home() {
  const router = useRouter();
  const { locale, m } = useI18n();
  const [count, setCount] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // The stream sends the number of counters, and again whenever one is
    // created. EventSource reconnects on its own and receives it afresh.
    const events = new EventSource("/api/counters/stream");

    events.addEventListener("count", (event) => {
      setCount(JSON.parse(event.data));
    });

    return () => {
      events.close();
    };
  }, []);

  const createCounter = async () => {
    setCreating(true);
    let rateLimited = false;
    try {
      const response = await fetch("/api/counters", { method: "POST" });
      rateLimited = response.status === 429;
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const { id } = await response.json();
      // The button stays disabled until the counter's page replaces this one
      router.push(`/c/${id}`);
    } catch (error) {
      console.error("Error creating counter:", error);
      setCreating(false);
      setError(rateLimited ? m.createRateLimited : m.createFailed);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" align="center" sx={{ mb: 4 }}>
        {m.tagline}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={createCounter}
          loading={creating}
          loadingPosition="start"
          startIcon={<AddCircleOutlinedIcon />}
          size="large"
        >
          {m.createCounter}
        </Button>
      </Box>

      {count !== null && (
        <Typography align="center" data-testid="counter-count">
          {plural(locale, m.countersCreated, count)}
        </Typography>
      )}

      <Typography align="center" sx={{ mt: 6, color: "text.secondary" }}>
        {m.tryDemo}
      </Typography>
      <LiveCounter id={DEMO_COUNTER_ID} />

      <ErrorToast message={error} onClose={() => setError("")} />

      <Box sx={{ mt: 8, mb: 4 }}>
        <Copyright />
      </Box>
    </Container>
  );
}
