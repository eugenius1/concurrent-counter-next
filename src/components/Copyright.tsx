"use client";

import * as React from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/I18nProvider";
import { copyrightYears } from "@/lib/copyrightYears";

export default function Copyright() {
  const { m } = useI18n();
  return (
    <Typography
      variant="body2"
      align="center"
      // The notice is in Latin script in every language; inside right-to-left
      // text its year range would otherwise read backwards
      dir="ltr"
      sx={{
        color: "text.secondary",
      }}
    >
      {fill(m.copyright, { years: copyrightYears() })}
      {" · "}
      <Link
        href="https://github.com/eugenius1/concurrent-counter-next/blob/main/LICENSE"
        title={m.licenceTitle}
        color="inherit"
      >
        {m.licence}
      </Link>
    </Typography>
  );
}
