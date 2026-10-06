import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
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
      <Link href="/" aria-label="Concurrent Counter home">
        <Image
          src="/icon/icon-192.png"
          alt=""
          width={40}
          height={40}
          style={{ display: "block" }}
        />
      </Link>
      <ModeSwitch />
    </Box>
  );
}
