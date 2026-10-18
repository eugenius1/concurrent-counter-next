"use client";
import { extendTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const options: Parameters<typeof extendTheme>[0] = {
  colorSchemes: {
    light: {
      palette: {},
    },
    dark: {
      palette: {},
    },
  },
  cssVarPrefix: "mui",
  // Without this the colours follow only the OS preference and the theme
  // menu changes nothing. Matches InitColorSchemeScript in the layout.
  colorSchemeSelector: "class",
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
};

const theme = extendTheme(options);

/** The same theme for languages written right to left. */
export const rtlTheme = extendTheme({ ...options, direction: "rtl" });

export default theme;
