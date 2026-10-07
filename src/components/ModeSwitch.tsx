"use client";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlined from "@mui/icons-material/SettingsBrightnessOutlined";
import { useColorScheme } from "@mui/material/styles";
import { useI18n } from "@/i18n/I18nProvider";
import { fill } from "@/i18n/format";

const MODES = [
  { value: "system", label: "themeSystem", Icon: SettingsBrightnessOutlined },
  { value: "light", label: "themeLight", Icon: LightModeOutlined },
  { value: "dark", label: "themeDark", Icon: DarkModeOutlined },
] as const;

export default function ModeSwitch() {
  const { mode, setMode } = useColorScheme();
  const { m } = useI18n();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  if (!mode) {
    return null;
  }
  const current = MODES.find((m) => m.value === mode) ?? MODES[0];
  const label = fill(m.themeLabel, { mode: m[current.label] });
  return (
    <>
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          aria-haspopup="menu"
          aria-controls={anchor ? "mode-menu" : undefined}
          aria-expanded={anchor ? "true" : undefined}
          color="inherit"
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <current.Icon />
        </IconButton>
      </Tooltip>
      <Menu
        id="mode-menu"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {MODES.map(({ value, label, Icon }) => (
          <MenuItem
            key={value}
            // A radio, so a screen reader says which theme is the current one
            role="menuitemradio"
            selected={value === mode}
            onClick={() => {
              setMode(value);
              setAnchor(null);
            }}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{m[label]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
