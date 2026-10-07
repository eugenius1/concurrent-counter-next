"use client";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import TranslateOutlined from "@mui/icons-material/TranslateOutlined";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/i18n/locales";

/** Keeps the choice for a year, for the server to read on the next load. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export default function LanguageSwitch() {
  const { locale, m } = useI18n();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  const choose = (chosen: Locale) => {
    setAnchor(null);
    if (chosen === locale) return;
    rememberLocale(chosen);
    // A full load, not a refresh: the direction of the styles is fixed when
    // the page first renders
    window.location.reload();
  };

  return (
    <>
      <Tooltip title={m.language}>
        <IconButton
          aria-label={m.language}
          aria-haspopup="menu"
          aria-controls={anchor ? "language-menu" : undefined}
          aria-expanded={anchor ? "true" : undefined}
          color="inherit"
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <TranslateOutlined />
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {LOCALES.map(({ code, name }) => (
          // Each name is in its own language, whatever the page is in
          <MenuItem
            key={code}
            lang={code}
            role="menuitemradio"
            selected={code === locale}
            onClick={() => choose(code)}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
