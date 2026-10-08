import type { Messages } from "./en";

const bn: Messages = {
  tagline:
    "একটি কাউন্টার তৈরি করুন, এর লিংক শেয়ার করুন, আর লিংক থাকা সবাই একই সময়ে এটি বদলাতে দেখবে।",
  createCounter: "নতুন কাউন্টার তৈরি করুন",
  countersCreated: {
    one: "এ পর্যন্ত {count}টি কাউন্টার তৈরি হয়েছে",
    other: "এ পর্যন্ত {count}টি কাউন্টার তৈরি হয়েছে",
  },
  tryDemo: "অথবা এটি চেষ্টা করুন, যা সব দর্শনার্থীর সঙ্গে শেয়ার করা:",
  createRateLimited:
    "আপনি অনেক কাউন্টার তৈরি করেছেন। এক মিনিট পরে আবার চেষ্টা করুন।",
  createFailed: "কাউন্টার তৈরি করা যায়নি। পরে আবার চেষ্টা করুন।",
  counterTitle: "কাউন্টার #{id}",
  decrease: "কমান",
  increase: "বাড়ান",
  updateRateLimited: "খুব বেশিবার চাপা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
  updateFailed: "কাউন্টার আপডেট করা যায়নি। পরে আবার চেষ্টা করুন।",
  anyoneWithLink:
    "এই পৃষ্ঠার লিংক যার কাছে আছে, সে-ই এই কাউন্টার দেখতে ও বদলাতে পারবে।",
  share: "শেয়ার করুন",
  copyLink: "লিংক কপি করুন",
  linkCopied: "লিংক কপি হয়েছে",
  copyFailed: "লিংক কপি করা যায়নি। অ্যাড্রেস বার থেকে কপি করুন।",
  themeLabel: "থিম: {mode}",
  themeSystem: "সিস্টেম",
  themeLight: "হালকা",
  themeDark: "গাঢ়",
  language: "ভাষা",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, সংস্করণ ৩ বা পরবর্তী",
};

export default bn;
