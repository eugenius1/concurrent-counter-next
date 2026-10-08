import type { Messages } from "./en";

const ar: Messages = {
  tagline:
    "أنشئ عدّادًا وشارك رابطه، وسيرى كل من لديه الرابط تغيّره في الوقت نفسه.",
  createCounter: "إنشاء عدّاد جديد",
  countersCreated: {
    zero: "لم يُنشأ أي عدّاد حتى الآن",
    one: "أُنشئ عدّاد واحد حتى الآن",
    two: "أُنشئ عدّادان حتى الآن",
    few: "أُنشئت {count} عدّادات حتى الآن",
    many: "أُنشئ {count} عدّادًا حتى الآن",
    other: "أُنشئ {count} عدّاد حتى الآن",
  },
  tryDemo: "أو جرّب هذا العدّاد المشترك بين جميع الزوّار:",
  createRateLimited: "لقد أنشأت عدّادات كثيرة. حاول مرة أخرى بعد دقيقة.",
  createFailed: "تعذّر إنشاء العدّاد. حاول مرة أخرى لاحقًا.",
  counterTitle: "العدّاد #{id}",
  decrease: "إنقاص",
  increase: "زيادة",
  updateRateLimited: "ضغطات كثيرة جدًا. حاول مرة أخرى بعد لحظة.",
  updateFailed: "تعذّر تحديث العدّاد. حاول مرة أخرى لاحقًا.",
  anyoneWithLink:
    "يمكن لأي شخص لديه رابط هذه الصفحة أن يرى هذا العدّاد ويغيّره.",
  share: "مشاركة",
  copyLink: "نسخ الرابط",
  linkCopied: "تم نسخ الرابط",
  copyFailed: "تعذّر نسخ الرابط. انسخه من شريط العنوان.",
  themeLabel: "المظهر: {mode}",
  themeSystem: "النظام",
  themeLight: "فاتح",
  themeDark: "داكن",
  language: "اللغة",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License، الإصدار 3 أو أحدث",
};

export default ar;
