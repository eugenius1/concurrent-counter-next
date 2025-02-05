"use client";

import { useState, useEffect } from "react";
import { Container, Button, Typography, Box } from "@mui/material";
import Counter from "../components/Counter";
import { supabase } from "../lib/supabase";
import { ulid } from "ulid";

export default function Home() {
  const [counters, setCounters] = useState<string[]>([]);

  useEffect(() => {
    // Fetch existing counters
    const fetchCounters = async () => {
      const { data, error } = await supabase
        .from("counters")
        .select("id")
        .order("id");

      if (error) {
        console.error("Error fetching counters:", error);
        return;
      }

      setCounters(data.map((counter) => counter.id));
    };

    fetchCounters();

    // Subscribe to new counters
    const subscription = supabase
      .channel("counters")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "counters",
        },
        (payload: any) => {
          setCounters((prev) => [...prev, payload.new.id]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createCounter = async () => {
    const id = ulid(); // Generate a ULID for the new counter
    const { data, error } = await supabase
      .from("counters")
      .insert([{ id, value: 0 }])
      .select();

    if (error) {
      console.error("Error creating counter:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Concurrent Counter App
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={createCounter}
          size="large"
        >
          Create New Counter
        </Button>
      </Box>

      {counters.map((id) => (
        <Counter key={id} id={id} />
      ))}
    </Container>
  );
}
