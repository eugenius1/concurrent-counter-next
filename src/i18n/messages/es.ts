import type { Messages } from "./en";

const es: Messages = {
  tagline:
    "Crea un contador, comparte su enlace y todos los que tengan el enlace lo verán cambiar al mismo tiempo.",
  createCounter: "Crear contador nuevo",
  countersCreated: {
    one: "{count} contador creado hasta ahora",
    many: "{count} de contadores creados hasta ahora",
    other: "{count} contadores creados hasta ahora",
  },
  tryDemo: "O prueba este, compartido con todos los que visitan la página:",
  createRateLimited:
    "Has creado muchos contadores. Inténtalo de nuevo en un minuto.",
  createFailed: "No se pudo crear el contador. Inténtalo de nuevo más tarde.",
  counterTitle: "Contador #{id}",
  decrease: "Disminuir",
  increase: "Aumentar",
  updateRateLimited:
    "Demasiadas pulsaciones. Inténtalo de nuevo en un momento.",
  updateFailed:
    "No se pudo actualizar el contador. Inténtalo de nuevo más tarde.",
  anyoneWithLink:
    "Cualquiera que tenga el enlace a esta página puede ver y cambiar este contador.",
  share: "Compartir",
  copyLink: "Copiar enlace",
  linkCopied: "Enlace copiado",
  copyFailed:
    "No se pudo copiar el enlace. Cópialo desde la barra de direcciones.",
  themeLabel: "Tema: {mode}",
  themeSystem: "Sistema",
  themeLight: "Claro",
  themeDark: "Oscuro",
  language: "Idioma",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, versión 3 o posterior",
};

export default es;
