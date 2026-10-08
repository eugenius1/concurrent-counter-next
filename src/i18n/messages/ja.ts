import type { Messages } from "./en";

const ja: Messages = {
  tagline:
    "カウンターを作成してリンクを共有すると、リンクを知っている全員が同時に変化を見られます。",
  createCounter: "新しいカウンターを作成",
  countersCreated: {
    other: "これまでに {count} 個のカウンターが作成されました",
  },
  tryDemo: "または、訪問者全員で共有しているこちらをお試しください：",
  createRateLimited:
    "カウンターを作成しすぎました。1分後にもう一度お試しください。",
  createFailed:
    "カウンターを作成できませんでした。しばらくしてからもう一度お試しください。",
  counterTitle: "カウンター #{id}",
  decrease: "減らす",
  increase: "増やす",
  updateRateLimited:
    "押す回数が多すぎます。少し待ってからもう一度お試しください。",
  updateFailed:
    "カウンターを更新できませんでした。しばらくしてからもう一度お試しください。",
  anyoneWithLink:
    "このページのリンクを知っている人は誰でも、このカウンターを見て変更できます。",
  share: "共有",
  copyLink: "リンクをコピー",
  linkCopied: "リンクをコピーしました",
  copyFailed:
    "リンクをコピーできませんでした。アドレスバーからコピーしてください。",
  themeLabel: "テーマ：{mode}",
  themeSystem: "システム",
  themeLight: "ライト",
  themeDark: "ダーク",
  language: "言語",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License バージョン3以降",
};

export default ja;
