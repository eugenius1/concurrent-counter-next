import type { Messages } from "./en";

const pcm: Messages = {
  tagline:
    "Create counter, share di link, and everybody wey get di link go see am change at di same time.",
  createCounter: "Create New Counter",
  countersCreated: {
    one: "Dem don create {count} counter so far",
    other: "Dem don create {count} counter so far",
  },
  tryDemo: "Or try dis one, wey everybody wey visit dey share:",
  createRateLimited:
    "You don create plenty counter. Try again after one minute.",
  createFailed: "E no fit create counter. Try again later.",
  counterTitle: "Counter #{id}",
  decrease: "Reduce",
  increase: "Add",
  updateRateLimited: "You don press am too much. Try again small time.",
  updateFailed: "E no fit update di counter. Try again later.",
  anyoneWithLink:
    "Anybody wey get di link to dis page fit see and change dis counter.",
  share: "Share",
  copyLink: "Copy link",
  linkCopied: "Link don copy",
  copyFailed: "E no fit copy di link. Copy am from di address bar instead.",
  themeLabel: "Theme: {mode}",
  themeSystem: "System",
  themeLight: "Light",
  themeDark: "Dark",
  language: "Language",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, version 3 or later",
};

export default pcm;
