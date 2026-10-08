import type { Messages } from "./en";

const pt: Messages = {
  tagline:
    "Crie um contador, compartilhe o link, e todos que tiverem o link o verão mudar ao mesmo tempo.",
  createCounter: "Criar novo contador",
  countersCreated: {
    one: "{count} contador criado até agora",
    many: "{count} de contadores criados até agora",
    other: "{count} contadores criados até agora",
  },
  tryDemo: "Ou experimente este, compartilhado com todos os visitantes:",
  createRateLimited:
    "Você criou muitos contadores. Tente novamente em um minuto.",
  createFailed:
    "Não foi possível criar o contador. Tente novamente mais tarde.",
  counterTitle: "Contador #{id}",
  decrease: "Diminuir",
  increase: "Aumentar",
  updateRateLimited: "Cliques demais. Tente novamente em instantes.",
  updateFailed:
    "Não foi possível atualizar o contador. Tente novamente mais tarde.",
  anyoneWithLink:
    "Qualquer pessoa com o link desta página pode ver e alterar este contador.",
  share: "Compartilhar",
  copyLink: "Copiar link",
  linkCopied: "Link copiado",
  copyFailed: "Não foi possível copiar o link. Copie-o da barra de endereços.",
  themeLabel: "Tema: {mode}",
  themeSystem: "Sistema",
  themeLight: "Claro",
  themeDark: "Escuro",
  language: "Idioma",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, versão 3 ou posterior",
};

export default pt;
