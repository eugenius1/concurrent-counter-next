import type { Messages } from "./en";

const sw: Messages = {
  tagline:
    "Unda kihesabu, shiriki kiungo chake, na kila mtu mwenye kiungo ataona kikibadilika kwa wakati mmoja.",
  createCounter: "Unda Kihesabu Kipya",
  countersCreated: {
    one: "Kihesabu {count} kimeundwa hadi sasa",
    other: "Vihesabu {count} vimeundwa hadi sasa",
  },
  tryDemo: "Au jaribu hiki, kinachoshirikiwa na kila mtu anayetembelea:",
  createRateLimited:
    "Umeunda vihesabu vingi. Jaribu tena baada ya dakika moja.",
  createFailed: "Imeshindwa kuunda kihesabu. Jaribu tena baadaye.",
  counterTitle: "Kihesabu #{id}",
  decrease: "Punguza",
  increase: "Ongeza",
  updateRateLimited:
    "Umebonyeza mara nyingi mno. Jaribu tena baada ya muda mfupi.",
  updateFailed: "Imeshindwa kusasisha kihesabu. Jaribu tena baadaye.",
  anyoneWithLink:
    "Mtu yeyote mwenye kiungo cha ukurasa huu anaweza kuona na kubadilisha kihesabu hiki.",
  share: "Shiriki",
  copyLink: "Nakili kiungo",
  linkCopied: "Kiungo kimenakiliwa",
  copyFailed:
    "Imeshindwa kunakili kiungo. Kinakili kutoka kwenye upau wa anwani.",
  themeLabel: "Mandhari: {mode}",
  themeSystem: "Mfumo",
  themeLight: "Angavu",
  themeDark: "Giza",
  language: "Lugha",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, toleo la 3 au la baadaye",
};

export default sw;
