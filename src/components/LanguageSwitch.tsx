"use client";
import * as React from "react";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import TranslateOutlined from "@mui/icons-material/TranslateOutlined";
import { useI18n } from "@/i18n/I18nProvider";
import {
  LOCALE_COOKIE,
  localeName,
  menuOrder,
  type Locale,
} from "@/i18n/locales";

/** Keeps the choice for a year, for the server to read on the next load. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export default function LanguageSwitch() {
  const { locale, m } = useI18n();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  // Worked out when the menu opens: the browser's languages aren't known on
  // the server
  const [order, setOrder] = React.useState(() => menuOrder([]));

  const choose = (chosen: Locale) => {
    setAnchor(null);
    if (chosen === locale) return;
    rememberLocale(chosen);
    // A full load, not a refresh: the direction of the styles is fixed when
    // the page first renders
    window.location.reload();
  };

  const item = (code: Locale) => (
    // Each name is in its own language, whatever the page is in
    <MenuItem
      key={code}
      lang={code}
      role="menuitemradio"
      selected={code === locale}
      onClick={() => choose(code)}
    >
      {localeName(code)}
    </MenuItem>
  );

  return (
    <>
      <Tooltip title={m.language}>
        <IconButton
          aria-label={m.language}
          aria-haspopup="menu"
          aria-controls={anchor ? "language-menu" : undefined}
          aria-expanded={anchor ? "true" : undefined}
          color="inherit"
          onClick={(event) => {
            setOrder(menuOrder(navigator.languages ?? []));
            setAnchor(event.currentTarget);
          }}
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
        {order.pinned.map(item)}
        <Divider />
        {order.rest.map(item)}
      </Menu>
    </>
  );
}
