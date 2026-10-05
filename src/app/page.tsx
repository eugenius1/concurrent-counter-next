"use client";

import { useState, useEffect } from "react";
import { Container, Button, Typography, Box } from "@mui/material";
import Counter from "../components/Counter";
import Copyright from "../components/Copyright";

interface CounterData {
  id: string; // ULID is a string
  value: number;
}

export default function Home() {
  const [counters, setCounters] = useState<CounterData[]>([]);

  useEffect(() => {
    // One stream for the page: a snapshot of every counter, then live changes.
    // EventSource reconnects on its own and receives a fresh snapshot.
    const events = new EventSource("/api/counters/stream");

    events.addEventListener("snapshot", (event) => {
      setCounters(JSON.parse(event.data));
    });

    events.addEventListener("change", (event) => {
      const changed: CounterData = JSON.parse(event.data);
      setCounters((prev) =>
        prev.some((counter) => counter.id === changed.id)
          ? prev.map((counter) =>
              counter.id === changed.id ? changed : counter,
            )
          : [...prev, changed],
      );
    });

    return () => {
      events.close();
    };
  }, []);

  const createCounter = async () => {
    try {
      const response = await fetch("/api/counters", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating counter:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Concurrent Counter
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={createCounter}
          size="large"
        >
          Create New Counter
        </Button>
      </Box>

      {counters.map(({ id, value }) => (
        <Counter key={id} id={id} value={value} />
      ))}

      <Box sx={{ mt: 8, mb: 4 }}>
        <Copyright />
      </Box>
    </Container>
  );
}
