import type { Messages } from "./en";

const ru: Messages = {
  tagline:
    "Создайте счётчик, поделитесь ссылкой, и все, у кого есть ссылка, увидят его изменения одновременно.",
  createCounter: "Создать новый счётчик",
  countersCreated: {
    one: "На данный момент создан {count} счётчик",
    few: "На данный момент создано {count} счётчика",
    many: "На данный момент создано {count} счётчиков",
    other: "На данный момент создано {count} счётчика",
  },
  tryDemo: "Или попробуйте этот, общий для всех посетителей:",
  createRateLimited:
    "Вы создали много счётчиков. Повторите попытку через минуту.",
  createFailed: "Не удалось создать счётчик. Повторите попытку позже.",
  counterTitle: "Счётчик #{id}",
  decrease: "Уменьшить",
  increase: "Увеличить",
  updateRateLimited: "Слишком много нажатий. Повторите попытку чуть позже.",
  updateFailed: "Не удалось обновить счётчик. Повторите попытку позже.",
  anyoneWithLink:
    "Любой, у кого есть ссылка на эту страницу, может видеть и изменять этот счётчик.",
  share: "Поделиться",
  copyLink: "Скопировать ссылку",
  linkCopied: "Ссылка скопирована",
  copyFailed:
    "Не удалось скопировать ссылку. Скопируйте её из адресной строки.",
  themeLabel: "Тема: {mode}",
  themeSystem: "Системная",
  themeLight: "Светлая",
  themeDark: "Тёмная",
  language: "Язык",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, версия 3 или более поздняя",
};

export default ru;
