import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function Counter({ id, value }: { id: string; value: string }) {
  // The new value arrives through the counter page's event stream
  const updateCounter = async (incrementBy: number) => {
    try {
      const response = await fetch(`/api/counters/${id}/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ by: incrementBy }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating counter:", error);
    }
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
          Counter #{id.slice(-6)}
        </Typography>
        <Typography variant="h2" component="div">
          {value}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
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
