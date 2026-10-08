import type { Messages } from "./en";

const zh: Messages = {
  tagline:
    "创建一个计数器，分享它的链接，所有拿到链接的人都能同时看到它的变化。",
  createCounter: "创建新计数器",
  countersCreated: {
    other: "目前已创建 {count} 个计数器",
  },
  tryDemo: "或者试试这个，所有访问者共用：",
  createRateLimited: "你创建的计数器太多了，请一分钟后再试。",
  createFailed: "无法创建计数器，请稍后再试。",
  counterTitle: "计数器 #{id}",
  decrease: "减少",
  increase: "增加",
  updateRateLimited: "点击太频繁了，请稍后再试。",
  updateFailed: "无法更新计数器，请稍后再试。",
  anyoneWithLink: "任何拿到此页面链接的人都可以查看并更改这个计数器。",
  share: "分享",
  copyLink: "复制链接",
  linkCopied: "链接已复制",
  copyFailed: "无法复制链接，请从地址栏复制。",
  themeLabel: "主题：{mode}",
  themeSystem: "跟随系统",
  themeLight: "浅色",
  themeDark: "深色",
  language: "语言",
  copyright: "© {years} Eusebius Ngemera",
  licence: "GPLv3",
  licenceTitle: "GNU General Public License，第 3 版或更高版本",
};

export default zh;
