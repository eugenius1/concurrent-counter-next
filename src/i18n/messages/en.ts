const en = {
  tagline:
    "Create a counter, share its link, and everyone with the link sees it change at the same time.",
  createCounter: "Create New Counter",
  countersCreated: {
    one: "{count} counter created so far",
    other: "{count} counters created so far",
  } as PluralForms,
  tryDemo: "Or try this one, shared with everyone who visits:",
  createRateLimited: "You've created a lot of counters. Try again in a minute.",
  createFailed: "Couldn't create a counter. Try again later.",
  counterTitle: "Counter #{id}",
  decrease: "Decrease",
  increase: "Increase",
  updateRateLimited: "That's too many presses. Try again in a moment.",
  updateFailed: "Couldn't update the counter. Try again later.",
  anyoneWithLink:
    "Anyone with the link to this page can see and change this counter.",
  share: "Share",
  copyLink: "Copy link",
  linkCopied: "Link copied",
  copyFailed: "Couldn't copy the link. Copy it from the address bar instead.",
  themeLabel: "Theme: {mode}",
  themeSystem: "System",
  themeLight: "Light",
  themeDark: "Dark",
  language: "Language",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, version 3 or later",
};

/** One string per plural category the language has; `other` always exists. */
export type PluralForms = { other: string } & Partial<
  Record<"zero" | "one" | "two" | "few" | "many", string>
>;

export type Messages = typeof en;

export default en;
