(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reading progress */
  const progress = document.getElementById("progress");
  if (progress) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Theme */
  const themeRoot = document.documentElement;
  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  const applyTheme = (theme) => {
    themeRoot.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("halden-theme", theme);
    } catch (e) {
      /* ignore */
    }
    const dark = theme === "dark";
    themeButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    });
  };
  applyTheme(themeRoot.getAttribute("data-theme") || "light");
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(themeRoot.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  });

  /* Mobile nav */
  const menuBtn = document.querySelector("[data-menu]");
  const mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    const toggle = () => {
      const open = mobileNav.classList.toggle("is-open");
      mobileNav.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
    };
    menuBtn.addEventListener("click", toggle);
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        mobileNav.hidden = true;
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Copy + line reveals */
  const setDelay = (el) => {
    const delay = el.getAttribute("data-delay");
    if (delay) el.style.setProperty("--delay", `${delay}ms`);
  };

  const showIn = (el) => {
    setDelay(el);
    el.classList.add("is-in");
  };

  const playSequence = (root, step = 160) => {
    const parts = [...root.querySelectorAll(":scope > [data-in]")];
    if (reduceMotion) {
      parts.forEach(showIn);
      return;
    }
    parts.forEach((el, i) => {
      el.style.setProperty("--delay", `${i * step}ms`);
      window.setTimeout(() => el.classList.add("is-in"), 40);
    });
  };

  const copyNodes = [...document.querySelectorAll("[data-in]")].filter(
    (el) => !el.closest(".handoff") && !el.classList.contains("price-proof-item") && !el.closest(".price-proof")
  );
  copyNodes.forEach(setDelay);

  if (reduceMotion) {
    copyNodes.forEach((el) => el.classList.add("is-in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    copyNodes.forEach((el) => io.observe(el));
  } else {
    copyNodes.forEach((el) => el.classList.add("is-in"));
  }

  /* Count-up stats */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const run = (el) => {
      const target = Number(el.getAttribute("data-count"));
      const decimals = Number(el.getAttribute("data-decimals") || 0);
      const suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) {
        el.textContent =
          (decimals ? target.toFixed(decimals) : target.toLocaleString("en-GB")) + suffix;
        return;
      }
      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent =
          (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-GB")) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              run(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((el) => io.observe(el));
    } else {
      counters.forEach(run);
    }
  }

  /* FAQ */
  document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const open = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".faq-q")?.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Sticky CTA after trust */
  const sticky = document.getElementById("sticky-cta");
  const trust = document.getElementById("trust");
  const act = document.getElementById("act");
  if (sticky && trust) {
    const onScroll = () => {
      const pastTrust = window.scrollY > trust.offsetTop + 120;
      const inAct = act ? window.scrollY + window.innerHeight > act.offsetTop + 80 : false;
      sticky.classList.toggle("is-on", pastTrust && !inAct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Modal */
  const overlay = document.getElementById("start-modal");
  const openers = document.querySelectorAll("[data-open-start]");
  const closeBtn = document.querySelector("[data-close-modal]");
  const modalCopy = {
    buy: {
      kicker: "Get Halden",
      title: "We’ll put it on your line.",
      lead: "€890 a month, per location. Same-afternoon setup. Tell us the call you do not want guessed.",
      submit: "Send — we’ll start this week",
      doneTitle: "Received. We’ll be in touch today.",
      doneLead: "If the line is busy on your side, check email. No deck attached.",
    },
    walk: {
      kicker: "Book a short call",
      title: "Fifteen minutes. One difficult call.",
      lead: "No deck. We talk through the call you are afraid a machine would get wrong.",
      submit: "Book the call",
      doneTitle: "Received. We’ll send a time today.",
      doneLead: "Fifteen minutes. No pitch deck. Check email if we miss you.",
    },
  };

  const applyIntent = (intent) => {
    const copy = modalCopy[intent] || modalCopy.buy;
    const kicker = overlay?.querySelector("[data-modal-kicker]");
    const title = document.getElementById("modal-title");
    const lead = overlay?.querySelector("[data-modal-lead]");
    const submit = overlay?.querySelector("[data-modal-submit]");
    const doneTitle = overlay?.querySelector("[data-modal-done-title]");
    const doneLead = overlay?.querySelector("[data-modal-done-lead]");
    const intentField = document.getElementById("m-intent");
    if (kicker) kicker.textContent = copy.kicker;
    if (title) title.textContent = copy.title;
    if (lead) lead.textContent = copy.lead;
    if (submit) submit.textContent = copy.submit;
    if (doneTitle) doneTitle.textContent = copy.doneTitle;
    if (doneLead) doneLead.textContent = copy.doneLead;
    if (intentField) intentField.value = modalCopy[intent] ? intent : "buy";
  };

  const openModal = (event) => {
    if (!overlay) return;
    event.preventDefault();
    applyIntent(event.currentTarget.getAttribute("data-intent") || "buy");
    overlay.hidden = false;
    overlay.classList.add("is-open");
    document.body.classList.add("modal-lock");
    window.setTimeout(() => document.getElementById("m-name")?.focus(), 20);
  };

  const closeModal = () => {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.hidden = true;
    document.body.classList.remove("modal-lock");
  };

  openers.forEach((el) => el.addEventListener("click", openModal));
  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay?.classList.contains("is-open")) closeModal();
  });

  /* Forms */
  const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateField = (field) => {
    const input = field.querySelector("input, textarea");
    if (!input) return true;
    let ok = input.value.trim().length > 0;
    if (input.type === "email") ok = emailOk(input.value.trim());
    field.classList.toggle("is-bad", !ok);
    input.classList.toggle("is-invalid", !ok);
    return ok;
  };

  const bindForm = (form, onSuccess) => {
    if (!form) return;
    form.setAttribute("novalidate", "");
    form.querySelectorAll(".field").forEach((field) => {
      const input = field.querySelector("input, textarea");
      input?.addEventListener("blur", () => {
        if (input.value.length || field.classList.contains("is-bad")) validateField(field);
      });
    });
    const submit = () => {
      const fields = [...form.querySelectorAll(".field")];
      const ok = fields.map(validateField).every(Boolean);
      if (ok) onSuccess();
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submit();
    });
    form.querySelector("[data-submit]")?.addEventListener("click", submit);
  };

  bindForm(document.getElementById("modal-form"), () => {
    document.getElementById("modal-form-wrap")?.setAttribute("hidden", "");
    document.getElementById("modal-success")?.classList.add("is-on");
  });

  bindForm(document.getElementById("start-form"), () => {
    document.getElementById("start-form")?.setAttribute("hidden", "");
    document.getElementById("start-success")?.classList.add("is-on");
  });

  if (new URLSearchParams(window.location.search).get("intent") === "walk") {
    const kicker = document.getElementById("start-kicker");
    const title = document.getElementById("start-title");
    const lead = document.getElementById("start-lead");
    const submit = document.getElementById("start-submit");
    const field = document.getElementById("intent");
    if (kicker) kicker.textContent = "Book a short call";
    if (title) title.textContent = "Fifteen minutes. One difficult call.";
    if (lead) lead.textContent = "No deck. We talk through the call you are afraid a machine would get wrong.";
    if (submit) submit.textContent = "Book the call";
    if (field) field.value = "walk";
    document.title = "Book a short call — Halden";
    const switcher = document.getElementById("start-switch");
    if (switcher) switcher.innerHTML = 'Ready this afternoon? <a href="start.html">Get Halden</a>.';
  }

  /* Savings calculator */
  const calls = document.getElementById("save-calls");
  const visit = document.getElementById("save-value");
  if (calls && visit) {
    const money = (n) =>
      "€" + Math.round(n).toLocaleString("en-GB");
    const paint = () => {
      const visitValue = Number(visit.value);
      const weekly = Number(calls.value) * visitValue;
      const yearly = weekly * 52;
      const net = yearly - 890 * 12;
      const hours = Math.round((Number(calls.value) * 8 * 4.33) / 60);
      const coverWeek = Math.max(1, Math.ceil(890 / (visitValue * 4.33)));
      const callsOut = document.getElementById("save-calls-out");
      const valueOut = document.getElementById("save-value-out");
      const coverCopy = document.getElementById("save-cover-copy");
      const netEl = document.getElementById("save-net");
      const yearEl = document.getElementById("save-year");
      const hoursEl = document.getElementById("save-hours");
      if (callsOut) callsOut.textContent = calls.value;
      if (valueOut) valueOut.textContent = "€" + visit.value;
      if (coverCopy) coverCopy.textContent = String(coverWeek);
      if (netEl) netEl.textContent = money(net);
      if (yearEl) yearEl.textContent = money(yearly);
      if (hoursEl) hoursEl.textContent = String(hours);
    };
    const tickAmount = () => {
      const netEl = document.getElementById("save-net");
      if (!netEl || reduceMotion) return;
      netEl.classList.remove("is-tick");
      void netEl.offsetWidth;
      netEl.classList.add("is-tick");
    };
    calls.addEventListener("input", () => {
      paint();
      tickAmount();
    });
    visit.addEventListener("input", () => {
      paint();
      tickAmount();
    });
    paint();
  }

  /* Hero voice stage */
  const voiceStage = document.getElementById("voice-stage");
  if (voiceStage) {
    const micBtn = voiceStage.querySelector("[data-voice-mic]");
    const askEl = voiceStage.querySelector("[data-voice-ask]");
    const replyEl = voiceStage.querySelector("[data-voice-reply]");
    const askLine = voiceStage.querySelector('[data-voice-line="ask"]');
    const replyLine = voiceStage.querySelector('[data-voice-line="reply"]');
    const hintEl = voiceStage.querySelector("[data-voice-hint]");
    const chips = [...voiceStage.querySelectorAll("[data-voice-chip]")];
    const idleHint = hintEl?.textContent || "";
    const scripts = {
      mic: [
        {
          ask: [
            { text: "Can I book a checkup for " },
            { text: "Thursday morning", highlight: true },
            { text: "?" },
          ],
          reply: [
            { text: "Thursday at 09:20 or 11:40 with Dr Shah. " },
            { text: "Which is better", highlight: true },
            { text: "?" },
          ],
        },
        {
          ask: [
            { text: "What if the AI " },
            { text: "gets it wrong in front of a patient", highlight: true },
            { text: "?" },
          ],
          reply: [
            { text: "It does not bluff. " },
            { text: "A briefed human joins the same call", highlight: true },
            { text: "." },
          ],
        },
        {
          ask: [
            { text: "Do I need a " },
            { text: "new number or phone system", highlight: true },
            { text: "?" },
          ],
          reply: [
            { text: "No. Forward the line you already have. " },
            { text: "Live the same afternoon", highlight: true },
            { text: "." },
          ],
        },
        {
          ask: [
            { text: "Are you still answering " },
            { text: "on Sunday evening", highlight: true },
            { text: "?" },
          ],
          reply: [
            { text: "First ring, 24/7. " },
            { text: "Weekends and holidays included", highlight: true },
            { text: "." },
          ],
        },
      ],
      arrive: {
        href: "#arrive",
        ask: [
          { text: "Why is " },
          { text: "Halden different", highlight: true },
          { text: "?" },
        ],
        reply: [
          { text: "The call does not fail " },
          { text: "in front of your customer", highlight: true },
          { text: "." },
        ],
      },
      trust: {
        href: "#trust",
        ask: [
          { text: "What happens " },
          { text: "if a call goes wrong", highlight: true },
          { text: "?" },
        ],
        reply: [
          { text: "A human joins the same line — " },
          { text: "already briefed", highlight: true },
          { text: "." },
        ],
      },
      how: {
        href: "#how",
        ask: [
          { text: "How is this not " },
          { text: "four times the same bot", highlight: true },
          { text: "?" },
        ],
        reply: [
          { text: "The expensive part is included: " },
          { text: "a briefed human on the live call", highlight: true },
          { text: "." },
        ],
      },
      reviews: {
        href: "#testimonials",
        ask: [
          { text: "What do " },
          { text: "other owners say", highlight: true },
          { text: "?" },
        ],
        reply: [
          { text: "They were not buying another bot. " },
          { text: "They were buying the hard call", highlight: true },
          { text: "." },
        ],
      },
      proof: {
        href: "#proof",
        ask: [
          { text: "Where is the " },
          { text: "proof", highlight: true },
          { text: "?" },
        ],
        reply: [
          { text: "2,400+ businesses already on Halden. " },
          { text: "See what the calls are worth", highlight: true },
          { text: "." },
        ],
      },
      faq: {
        href: "#faq",
        ask: [
          { text: "What do people " },
          { text: "usually ask", highlight: true },
          { text: "?" },
        ],
        reply: [
          { text: "The hard ones: a wrong answer, a new number, " },
          { text: "and how soon it can be live", highlight: true },
          { text: "." },
        ],
      },
      pricing: {
        href: "#pricing",
        ask: [
          { text: "What is " },
          { text: "the price", highlight: true },
          { text: "?" },
        ],
        reply: [
          { text: "€890 a month. " },
          { text: "Live in one afternoon", highlight: true },
          { text: "." },
        ],
      },
    };

    let run = 0;
    let micIndex = 0;

    const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

    const renderFull = (target, parts) => {
      if (!target) return;
      target.replaceChildren();
      parts.forEach((part) => {
        const node = document.createElement("span");
        if (part.highlight) node.className = "voice-mark";
        node.textContent = part.text;
        target.appendChild(node);
      });
    };

    const typeParts = async (target, parts, token) => {
      if (!target) return;
      target.replaceChildren();
      if (reduceMotion) {
        renderFull(target, parts);
        return;
      }
      for (const part of parts) {
        const node = document.createElement("span");
        if (part.highlight) node.className = "voice-mark";
        target.appendChild(node);
        for (const ch of part.text) {
          if (token !== run) return;
          node.textContent += ch;
          await sleep(ch === " " ? 16 : 24);
        }
      }
    };

    const setTyping = (line) => {
      askLine?.classList.toggle("is-typing", line === "ask");
      replyLine?.classList.toggle("is-typing", line === "reply");
    };

    const play = async (script, key) => {
      if (!script) return;
      const token = ++run;
      voiceStage.classList.add("is-listening");
      micBtn?.setAttribute("aria-pressed", "true");
      chips.forEach((chip) => chip.classList.toggle("is-on", chip.getAttribute("data-voice-chip") === key));
      askEl?.replaceChildren();
      replyEl?.replaceChildren();
      if (hintEl) hintEl.textContent = "Listening…";
      setTyping("ask");
      await typeParts(askEl, script.ask, token);
      if (token !== run) return;
      await sleep(reduceMotion ? 0 : 280);
      if (token !== run) return;
      if (hintEl) hintEl.textContent = script.href ? "Taking you there…" : "Halden";
      setTyping("reply");
      await typeParts(replyEl, script.reply, token);
      if (token !== run) return;
      await sleep(reduceMotion ? 0 : 640);
      if (token !== run) return;
      setTyping(null);
      voiceStage.classList.remove("is-listening");
      micBtn?.setAttribute("aria-pressed", "false");
      micBtn?.setAttribute("aria-label", "Ask Halden again");
      if (hintEl) hintEl.textContent = idleHint;
      if (script.href && token === run) {
        const target = document.querySelector(script.href);
        target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    };

    micBtn?.addEventListener("click", () => {
      const script = scripts.mic[micIndex % scripts.mic.length];
      micIndex += 1;
      chips.forEach((chip) => chip.classList.remove("is-on"));
      play(script, "mic");
    });

    chips.forEach((chip) => {
      chip.addEventListener("click", (event) => {
        const key = chip.getAttribute("data-voice-chip");
        const script = scripts[key];
        if (!script) return;
        event.preventDefault();
        play(script, key);
      });
    });
  }

  /* Clay-press reveal */
  const heroCard = document.querySelector(".hero .voice-stage");
  if (heroCard) heroCard.style.setProperty("--delay", "480ms");

  const onCardShown = (card) => {
    card.classList.add("is-shown");
    const wait = reduceMotion ? 0 : 60 + (Number.parseInt(card.style.getPropertyValue("--delay"), 10) || 0);
    window.setTimeout(() => {
      if (card.classList.contains("handoff")) playSequence(card, 170);
      if (card.classList.contains("price-card")) {
        playSequence(card.querySelector(".price-proof") || card, 110);
      }
    }, wait);
  };

  const cards = [...document.querySelectorAll(".card")].filter((el) => !el.closest(".modal"));
  cards.forEach((card, i) => {
    card.setAttribute("data-reveal", "");
    if (!card.style.getPropertyValue("--delay")) {
      card.style.setProperty("--delay", `${Math.min(i % 4, 3) * 70}ms`);
    }
  });
  if (reduceMotion) {
    cards.forEach(onCardShown);
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onCardShown(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    cards.forEach((card) => io.observe(card));
  } else {
    cards.forEach(onCardShown);
  }
})();
