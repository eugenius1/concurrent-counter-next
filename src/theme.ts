"use client";
import { extendTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = extendTheme({
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
  // TODO: Is this needed?
  // components: {
  //   MuiAlert: {
  //     styleOverrides: {
  //       root: ({ theme, ownerState }) => ({
  //         ...(ownerState.severity === "info" && {
  //           backgroundColor: "#60a5fa",
  //         }),
  //       }),
  //     },
  //   },
  // },
});

export default theme;
