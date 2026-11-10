// 页面文案和作品都在这里改。某条作品以后如果有视频，加上 video 字段即可，图片窗会改播视频。
// scan 是对应作品的小程序码，会显示在卡片下方左侧，并跟着作品一起切换。
window.SITE_CONTENT = {
  portrait: {
    src: "images/mvp/人物形象.png",
  },
  i18n: {
    zh: {
      portraitAlt: "人物形象",
      portraitLabel: "人物形象",
      worksLabel: "作品",
      slidesLabel: "作品切换",
      langGroup: "语言",
      langZh: "中文",
      langEn: "英文",
      intro: {
        title: "关于我",
        subtitle: "个人作品集 · 简介 · 兴趣",
        paragraphs: [
          "Hi, U.\n我是一个没有固定身份的全栈工程师。\n理想生活大概是：傍晚开着黄色福特野马，停在自营的日咖夜酒小店开始2小时的驻唱...",
          "我好像不是一个专才，也似乎没有天赋成为一个专才。兴趣倒是不少，唱歌跳舞、钢琴、羽毛球、篮球、读书、傍晚在有暖黄色路灯的林荫小路上漫无目的地散步。",
          "自由洒脱和感性纠结并存，不想被定义，也想一直保持好奇的双子...",
        ],
        educationTitle: "信息",
        educationDetail: "张晶晶｜00｜2444565820@qq.com｜esfj｜双子",
      },
      skills: {
        label: "作品",
      },
    },
    en: {
      portraitAlt: "Portrait",
      portraitLabel: "Portrait",
      worksLabel: "Works",
      slidesLabel: "Slides",
      langGroup: "Language",
      langZh: "Chinese",
      langEn: "English",
      intro: {
        title: "About Me",
        subtitle: "Personal Portfolio · Profile · Interests",
        paragraphs: [
          "Hi, U.\nI'm a full-stack engineer without a fixed identity.\nThe life I picture goes something like this: at dusk I drive a yellow Ford Mustang, pull up at the café-by-day, bar-by-night I run myself, and start a two-hour set...",
          "I don't seem to be a specialist, or gifted enough to become one. Interests, though, I have plenty: singing and dancing, piano, badminton, basketball, reading, and wandering with nowhere to be at dusk, along a tree-lined path lit by warm yellow streetlights.",
          "Free-spirited and sentimentally tangled, both at once. I don't want to be defined, and I want to stay a curious Gemini...",
        ],
        educationTitle: "INFO",
        educationDetail: "jingjing Zhang｜00｜2444565820@qq.com｜esfj｜Gemini",
      },
      skills: {
        label: "PRODUCTS",
      },
    },
  },
  works: [
    {
      image: "images/works/01.png",
      scan: "images/scan/01.png",
      zh: {
        title: "旅行小咪",
        note: "微信小程序，陪它出发也等它回家",
      },
      en: {
        title: "Travel Mimi",
        note: "See it off, and wait for it to come home.",
      },
    },
    {
      image: "images/works/02.png",
      scan: "images/scan/02.png",
      zh: {
        title: "吃什么-随手记下的便是答案",
        note: "微信小程序，解决吃什么的人生难题",
      },
      en: {
        title: "What to Eat — jot it down, that's the answer",
        note: "A mini program for what to eat.",
      },
    },
  ],
  carousel: {
    intervalMs: 1800,
    durationMs: 680,
  },
};
