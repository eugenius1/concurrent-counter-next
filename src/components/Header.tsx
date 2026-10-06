import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ModeSwitch from "./ModeSwitch";

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 1,
      }}
    >
      {/* Box can't take Link as its component here: a server component
          can't pass a function to a client one */}
      <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Image src="/icon/icon-192.png" alt="" width={40} height={40} />
          <Typography variant="h6" component="span">
            Concurrent Counter
          </Typography>
        </Box>
      </Link>
      <ModeSwitch />
    </Box>
  );
}
