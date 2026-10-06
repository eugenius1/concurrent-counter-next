"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Button, Typography, Box } from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import Copyright from "../components/Copyright";
import LiveCounter from "../components/LiveCounter";
import { DEMO_COUNTER_ID } from "../lib/demoCounter";

export default function Home() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

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
    try {
      const response = await fetch("/api/counters", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const { id } = await response.json();
      // The button stays disabled until the counter's page replaces this one
      router.push(`/c/${id}`);
    } catch (error) {
      console.error("Error creating counter:", error);
      setCreating(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" align="center" sx={{ mb: 4 }}>
        Create a counter, share its link, and everyone with the link sees it
        change at the same moment.
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
          Create New Counter
        </Button>
      </Box>

      {count !== null && (
        <Typography align="center" data-testid="counter-count">
          {count === 1
            ? "1 counter created so far"
            : `${count.toLocaleString("en")} counters created so far`}
        </Typography>
      )}

      <Typography align="center" sx={{ mt: 6, color: "text.secondary" }}>
        Or try this one, shared with everyone who visits:
      </Typography>
      <LiveCounter id={DEMO_COUNTER_ID} />

      <Box sx={{ mt: 8, mb: 4 }}>
        <Copyright />
      </Box>
    </Container>
  );
}
