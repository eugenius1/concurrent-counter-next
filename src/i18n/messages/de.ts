import type { Messages } from "./en";

const de: Messages = {
  tagline:
    "Erstelle einen Zähler, teile den Link, und alle mit dem Link sehen gleichzeitig, wie er sich ändert.",
  createCounter: "Neuen Zähler erstellen",
  countersCreated: {
    one: "Bisher wurde {count} Zähler erstellt",
    other: "Bisher wurden {count} Zähler erstellt",
  },
  tryDemo: "Oder probiere diesen aus, den sich alle Besucher teilen:",
  createRateLimited:
    "Du hast sehr viele Zähler erstellt. Versuche es in einer Minute erneut.",
  createFailed:
    "Der Zähler konnte nicht erstellt werden. Versuche es später erneut.",
  counterTitle: "Zähler #{id}",
  decrease: "Verringern",
  increase: "Erhöhen",
  updateRateLimited: "Zu viele Klicks. Versuche es gleich noch einmal.",
  updateFailed:
    "Der Zähler konnte nicht aktualisiert werden. Versuche es später erneut.",
  anyoneWithLink:
    "Jeder mit dem Link zu dieser Seite kann diesen Zähler sehen und ändern.",
  share: "Teilen",
  copyLink: "Link kopieren",
  linkCopied: "Link kopiert",
  copyFailed:
    "Der Link konnte nicht kopiert werden. Kopiere ihn aus der Adressleiste.",
  themeLabel: "Design: {mode}",
  themeSystem: "System",
  themeLight: "Hell",
  themeDark: "Dunkel",
  language: "Sprache",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, Version 3 oder später",
};

export default de;
