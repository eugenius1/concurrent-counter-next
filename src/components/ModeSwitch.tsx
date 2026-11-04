"use client";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlined from "@mui/icons-material/SettingsBrightnessOutlined";
import { useColorScheme } from "@mui/material/styles";
import { useI18n } from "@/i18n/I18nProvider";
import { fill } from "@/i18n/format";
import HeaderMenu from "./HeaderMenu";

const MODES = [
  { value: "system", label: "themeSystem", Icon: SettingsBrightnessOutlined },
  { value: "light", label: "themeLight", Icon: LightModeOutlined },
  { value: "dark", label: "themeDark", Icon: DarkModeOutlined },
] as const;

export default function ModeSwitch() {
  const { mode, setMode } = useColorScheme();
  const { m } = useI18n();
  if (!mode) {
    return null;
  }
  const current = MODES.find((entry) => entry.value === mode) ?? MODES[0];
  const label = fill(m.themeLabel, { mode: m[current.label] });
  return (
    <HeaderMenu id="mode-menu" label={label} icon={<current.Icon />}>
      {(close) =>
        MODES.map(({ value, label, Icon }) => (
          <MenuItem
            key={value}
            // A radio, so a screen reader says which theme is the current one
            role="menuitemradio"
            selected={value === mode}
            onClick={() => {
              setMode(value);
              close();
            }}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{m[label]}</ListItemText>
          </MenuItem>
        ))
      }
    </HeaderMenu>
  );
}
