import type { Messages } from "./en";

const hi: Messages = {
  tagline:
    "एक काउंटर बनाएँ, उसका लिंक साझा करें, और लिंक वाले सभी लोग उसे एक ही समय पर बदलते हुए देखेंगे।",
  createCounter: "नया काउंटर बनाएँ",
  countersCreated: {
    one: "अब तक {count} काउंटर बनाया गया",
    other: "अब तक {count} काउंटर बनाए गए",
  },
  tryDemo: "या इसे आज़माएँ, जो हर आने वाले के साथ साझा है:",
  createRateLimited:
    "आपने बहुत सारे काउंटर बना लिए हैं। एक मिनट बाद फिर कोशिश करें।",
  createFailed: "काउंटर नहीं बन सका। बाद में फिर कोशिश करें।",
  counterTitle: "काउंटर #{id}",
  decrease: "घटाएँ",
  increase: "बढ़ाएँ",
  updateRateLimited: "आपने बहुत बार दबाया है। थोड़ी देर बाद फिर कोशिश करें।",
  updateFailed: "काउंटर अपडेट नहीं हो सका। बाद में फिर कोशिश करें।",
  anyoneWithLink:
    "इस पेज का लिंक रखने वाला कोई भी व्यक्ति इस काउंटर को देख और बदल सकता है।",
  share: "साझा करें",
  copyLink: "लिंक कॉपी करें",
  linkCopied: "लिंक कॉपी हो गया",
  copyFailed: "लिंक कॉपी नहीं हो सका। इसे एड्रेस बार से कॉपी करें।",
  themeLabel: "थीम: {mode}",
  themeSystem: "सिस्टम",
  themeLight: "लाइट",
  themeDark: "डार्क",
  language: "भाषा",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License, संस्करण 3 या बाद का",
};

export default hi;
