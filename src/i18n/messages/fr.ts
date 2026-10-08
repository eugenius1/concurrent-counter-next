import type { Messages } from "./en";

const fr: Messages = {
  tagline:
    "Créez un compteur, partagez son lien, et tous ceux qui ont le lien le voient changer en même temps.",
  createCounter: "Créer un nouveau compteur",
  countersCreated: {
    one: "{count} compteur créé jusqu’à présent",
    many: "{count} de compteurs créés jusqu’à présent",
    other: "{count} compteurs créés jusqu’à présent",
  },
  tryDemo: "Ou essayez celui-ci, partagé avec tous les visiteurs :",
  createRateLimited:
    "Vous avez créé beaucoup de compteurs. Réessayez dans une minute.",
  createFailed: "Impossible de créer le compteur. Réessayez plus tard.",
  counterTitle: "Compteur #{id}",
  decrease: "Diminuer",
  increase: "Augmenter",
  updateRateLimited: "Trop d’appuis. Réessayez dans un instant.",
  updateFailed: "Impossible de mettre à jour le compteur. Réessayez plus tard.",
  anyoneWithLink:
    "Toute personne ayant le lien vers cette page peut voir et modifier ce compteur.",
  share: "Partager",
  copyLink: "Copier le lien",
  linkCopied: "Lien copié",
  copyFailed:
    "Impossible de copier le lien. Copiez-le depuis la barre d’adresse.",
  themeLabel: "Thème : {mode}",
  themeSystem: "Système",
  themeLight: "Clair",
  themeDark: "Sombre",
  language: "Langue",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, version 3 ou ultérieure",
};

export default fr;
