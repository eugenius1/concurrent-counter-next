import { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/I18nProvider";
import ErrorToast from "./ErrorToast";
import { postWrite } from "./postWrite";

export default function Counter({ id, value }: { id: string; value: string }) {
  const { m } = useI18n();
  const [error, setError] = useState("");

  // The new value arrives through the counter page's event stream
  const updateCounter = async (by: number) => {
    const result = await postWrite(`/api/counters/${id}/increment`, { by });
    if (result === "rateLimited") setError(m.updateRateLimited);
    else if (result === "failed") setError(m.updateFailed);
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, maxWidth: 400, mx: "auto", my: 2 }}
      data-testid={`counter-${id}`}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h2">
          {fill(m.counterTitle, { id: id.slice(-6) })}
        </Typography>
        <Typography variant="h2" component="div">
          {value}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => updateCounter(-1)}
            startIcon={<RemoveIcon />}
          >
            {m.decrease}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => updateCounter(1)}
            endIcon={<AddIcon />}
          >
            {m.increase}
          </Button>
        </Box>
      </Box>
      <ErrorToast message={error} onClose={() => setError("")} />
    </Paper>
  );
}
