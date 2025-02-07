import { useState, useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { supabase } from "../lib/supabase";

interface Counter {
  id: string; // ULID is a string
  value: number;
}

export default function Counter({ id }: { id: string }) {
  const [counter, setCounter] = useState<Counter | null>(null);

  useEffect(() => {
    // Fetch initial counter value
    const fetchCounter = async () => {
      const { data, error } = await supabase
        .from("counters")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching counter:", error);
        return;
      }

      setCounter(data);
    };

    fetchCounter();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`counter_${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "counters",
          filter: `id=eq.${id}`,
        },
        (payload: any) => {
          setCounter(payload.new as Counter);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const updateCounter = async (incrementBy: number) => {
    const { data, error } = await supabase.rpc("update_counter", {
      counter_id: id,
      increment_by: incrementBy,
    });

    if (error) {
      console.error("Error updating counter:", error);
    }
  };

  if (!counter) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: "auto", my: 2 }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography variant="h4" component="h2">
          Counter #{counter.id.slice(-6)}
        </Typography>
        <Typography variant="h2" component="div">
          {counter.value}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "error.main",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
            onClick={() => updateCounter(-1)}
            startIcon={<RemoveIcon />}
          >
            Decrease
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "success.main",
              "&:hover": {
                bgcolor: "success.dark",
              },
            }}
            onClick={() => updateCounter(1)}
            endIcon={<AddIcon />}
          >
            Increase
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
