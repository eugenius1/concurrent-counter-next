"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Typography, Box } from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import ErrorToast from "../components/ErrorToast";
import LiveCounter from "../components/LiveCounter";
import { postWrite } from "../components/postWrite";
import { useEventStream } from "../components/useEventStream";
import { DEMO_COUNTER_ID } from "../lib/demoCounter";
import { plural } from "@/i18n/format";
import { useI18n } from "@/i18n/I18nProvider";

export default function Home() {
  const router = useRouter();
  const { locale, m } = useI18n();
  const [count, setCount] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // The number of counters, sent again whenever one is created
  useEventStream("/api/counters/stream", "count", setCount);

  const createCounter = async () => {
    setCreating(true);
    const result = await postWrite("/api/counters");
    if (typeof result === "string") {
      setCreating(false);
      setError(
        result === "rateLimited" ? m.createRateLimited : m.createFailed,
      );
      return;
    }
    const { id } = await result.json();
    // The button stays disabled until the counter's page replaces this one
    router.push(`/c/${id}`);
  };

  return (
    <>
      <Typography variant="h5" component="h1" align="center" sx={{ mb: 4 }}>
        {m.tagline}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="contained"
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
    </>
  );
}
