(function () {
  const content = window.SITE_CONTENT;
  if (!content) return;

  const STAGE_WIDTH = 1600;
  const STAGE_HEIGHT = 900;
  const stage = document.getElementById("stage");
  const works = content.works || [];
  const duration = content.carousel?.durationMs ?? 680;
  const interval = content.carousel?.intervalMs ?? 3800;

  const LANG_KEY = "site-lang";
  let lang = readLang();

  const portrait = document.getElementById("portrait");
  portrait.src = content.portrait.src;

  const paragraphs = document.getElementById("intro-paragraphs");
  const langSwitch = document.getElementById("lang-switch");
  const portraitCol = document.querySelector(".col-portrait");
  const worksCol = document.querySelector(".col-works");

  const card = document.getElementById("card");
  const track = document.getElementById("card-track");
  const scanTrack = document.getElementById("scan-track");
  const dots = document.getElementById("dots");
  const cardCopy = document.getElementById("card-copy");
  const titleEl = document.getElementById("card-title");
  const noteEl = document.getElementById("card-note");

  track.style.setProperty("--slide-ms", duration + "ms");
  scanTrack.style.setProperty("--slide-ms", duration + "ms");

  works.forEach((work, i) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.append(createMedia(work));
    track.append(slide);

    const scanSlide = document.createElement("div");
    scanSlide.className = "scan-slide";
    if (work.scan) scanSlide.append(createScan(work));
    scanTrack.append(scanSlide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", textOf(work).title || String(i + 1));
    dot.addEventListener("click", () => goTo(i));
    dots.append(dot);
  });

  let index = 0;
  let timer = 0;
  let paused = false;
  let captionToken = 0;

  function createMedia(work) {
    if (work.video) {
      const video = document.createElement("video");
      video.className = "slide-media";
      video.src = work.video;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("playsinline", "");
      return video;
    }

    const img = document.createElement("img");
    img.className = "slide-media";
    img.src = work.image;
    img.alt = textOf(work).title || "";
    img.draggable = false;
    return img;
  }

  function createScan(work) {
    const img = document.createElement("img");
    img.className = "scan-media";
    img.src = work.scan;
    img.alt = textOf(work).title || "";
    img.draggable = false;
    return img;
  }

  function setTrack() {
    const offset = "translate3d(" + -index * 100 + "%, 0, 0)";
    track.style.transform = offset;
    scanTrack.style.transform = offset;
  }

  function updateDots() {
    Array.from(dots.children).forEach((dot, i) => {
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function readLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "zh" || saved === "en") return saved;
    } catch (error) {}
    return "zh";
  }

  function locale() {
    return (content.i18n && content.i18n[lang]) || content.i18n.zh;
  }

  function textOf(work) {
    if (work[lang]) return work[lang];
    return { title: work.title || "", note: work.note || "" };
  }

  function applyCopy() {
    const text = locale();
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.body.classList.toggle("lang-zh", lang === "zh");
    document.body.classList.toggle("lang-en", lang === "en");

    portrait.alt = text.portraitAlt || "";
    if (portraitCol) portraitCol.setAttribute("aria-label", text.portraitLabel || "");
    if (worksCol) worksCol.setAttribute("aria-label", text.worksLabel || "");

    document.getElementById("intro-title").textContent = text.intro.title;
    document.getElementById("intro-subtitle").textContent = text.intro.subtitle;
    document.getElementById("education-title").textContent = text.intro.educationTitle;
    document.getElementById("education-detail").textContent = text.intro.educationDetail;
    document.getElementById("skills-label").textContent = text.skills.label;

    paragraphs.replaceChildren();
    text.intro.paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      paragraphs.append(p);
    });

    dots.setAttribute("aria-label", text.slidesLabel || "");
    Array.from(dots.children).forEach((dot, i) => {
      const work = works[i];
      dot.setAttribute("aria-label", (work && textOf(work).title) || String(i + 1));
    });
    track.querySelectorAll("img.slide-media").forEach((img, i) => {
      const work = works[i];
      if (work) img.alt = textOf(work).title || "";
    });
    scanTrack.querySelectorAll("img.scan-media").forEach((img, i) => {
      const work = works[i];
      if (work) img.alt = textOf(work).title || "";
    });

    captionToken += 1;
    cardCopy.classList.remove("is-out");
    writeCaption();

    if (langSwitch) {
      langSwitch.classList.toggle("is-en", lang === "en");
      langSwitch.setAttribute("aria-label", text.langGroup || "");
      langSwitch.querySelectorAll(".lang-opt").forEach((button) => {
        const selected = button.dataset.lang === lang;
        button.setAttribute("aria-pressed", selected ? "true" : "false");
        button.setAttribute("aria-label", button.dataset.lang === "zh" ? text.langZh : text.langEn);
      });
    }
  }

  function setLang(next) {
    if (next !== "zh" && next !== "en") return;
    if (next === lang) return;
    lang = next;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (error) {}
    applyCopy();
  }

  function writeCaption() {
    const work = works[index];
    if (!work) return;
    const text = textOf(work);
    titleEl.textContent = text.title || "";
    noteEl.textContent = text.note || "";
  }

  function fadeCaption() {
    const token = ++captionToken;
    cardCopy.classList.add("is-out");
    window.setTimeout(() => {
      if (token !== captionToken) return;
      writeCaption();
      cardCopy.classList.remove("is-out");
    }, 180);
  }

  function syncVideo() {
    track.querySelectorAll("video").forEach((video, i) => {
      if (i === index) {
        const play = video.play();
        if (play) play.catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  function clearTimer() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function queue() {
    clearTimer();
    if (paused || works.length < 2) return;
    timer = window.setTimeout(() => {
      goTo(index + 1);
    }, interval);
  }

  function goTo(next) {
    if (!works.length) return;
    const target = (next + works.length) % works.length;
    if (target === index) return;
    index = target;
    setTrack();
    updateDots();
    fadeCaption();
    syncVideo();
    queue();
  }

  if (langSwitch) {
    langSwitch.addEventListener("click", (event) => {
      const button = event.target.closest(".lang-opt");
      if (!button) return;
      setLang(button.dataset.lang);
    });
  }

  card.addEventListener("mouseenter", () => {
    paused = true;
    clearTimer();
  });

  card.addEventListener("mouseleave", () => {
    paused = false;
    queue();
  });

  function fitStage() {
    const scale = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
    stage.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
  }

  applyCopy();
  updateDots();
  setTrack();
  syncVideo();
  queue();
  fitStage();
  window.addEventListener("resize", fitStage);
})();
