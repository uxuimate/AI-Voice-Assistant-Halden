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

  const openModal = (event) => {
    if (!overlay) return;
    event.preventDefault();
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

  /* Savings calculator */
  const calls = document.getElementById("save-calls");
  const visit = document.getElementById("save-value");
  if (calls && visit) {
    const money = (n) =>
      "€" + Math.round(n).toLocaleString("en-GB");
    const paint = () => {
      const weekly = Number(calls.value) * Number(visit.value);
      const yearly = weekly * 52;
      const net = yearly - 890 * 12;
      const hours = Math.round((Number(calls.value) * 8 * 4.33) / 60);
      const callsOut = document.getElementById("save-calls-out");
      const valueOut = document.getElementById("save-value-out");
      const netEl = document.getElementById("save-net");
      const yearEl = document.getElementById("save-year");
      const hoursEl = document.getElementById("save-hours");
      if (callsOut) callsOut.textContent = calls.value;
      if (valueOut) valueOut.textContent = "€" + visit.value;
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

  /* Clay-press reveal */
  const heroCard = document.querySelector(".hero-visual .handoff");
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
