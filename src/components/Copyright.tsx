import * as React from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { copyrightYears } from "@/lib/copyrightYears";

export default function Copyright() {
  return (
    <Typography
      variant="body2"
      align="center"
      sx={{
        color: "text.secondary",
      }}
    >
      {`© ${copyrightYears()} Eusebius Ngemera · `}
      <Link
        href="https://github.com/eugenius1/concurrent-counter-next/blob/main/LICENSE"
        title="GNU General Public License, version 3 or later"
        color="inherit"
      >
        GPLv3
      </Link>
    </Typography>
  );
}
