(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navToggle = document.getElementById("nav-toggle");
  const navPanel = document.getElementById("site-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const progress = document.getElementById("scroll-progress");
  const backToTop = document.getElementById("back-to-top");
  const cursorLight = document.getElementById("cursor-light");
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const projectCards = Array.from(document.querySelectorAll(".project-card"));
  const emptyProjects = document.getElementById("empty-projects");
  const typingText = document.getElementById("typing-text");
  const phrases = [
    "decision-ready dashboards.",
    "actionable business stories.",
    "clear KPI narratives.",
    "recruiter-ready insights."
  ];

  const throttleFrame = (callback) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
      ticking = true;
    };
  };

  const closeMenu = () => {
    navPanel.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    navPanel.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-open");
  };

  navToggle.addEventListener("click", () => {
    if (navPanel.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!navPanel.classList.contains("open")) return;
    if (navPanel.contains(event.target) || navToggle.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const updateScrollUi = throttleFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progress.style.width = `${Math.min(scrollRatio * 100, 100)}%`;
    backToTop.classList.toggle("visible", window.scrollY > 420);
  });

  window.addEventListener("scroll", updateScrollUi, { passive: true });
  updateScrollUi();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  if (!prefersReducedMotion && cursorLight) {
    document.addEventListener("pointermove", throttleFrame((event) => {
      cursorLight.style.opacity = "1";
      cursorLight.style.left = `${event.clientX}px`;
      cursorLight.style.top = `${event.clientY}px`;
    }), { passive: true });

    document.addEventListener("pointerleave", () => {
      cursorLight.style.opacity = "0";
    });
  }

  const revealElements = Array.from(document.querySelectorAll(".reveal, .skill-card"));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = entry.target.dataset.delay;
      if (delay) entry.target.style.setProperty("--delay", `${delay}ms`);
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -60px 0px" });

  revealElements.forEach((element) => revealObserver.observe(element));

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const updateActiveNav = () => {
  const scrollPos = window.scrollY + 150;

  let currentSection = sections[0];

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) {
      currentSection = section;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSection.id}`
    );
  });
};

window.addEventListener("scroll", throttleFrame(updateActiveNav), {
  passive: true
});

updateActiveNav();

  sections.forEach((section) => activeObserver.observe(section));

  const formatCount = (value) => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K+`;
    }
    return `${value}+`;
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.counter);
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progressRatio = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progressRatio, 3);
        const value = Math.round(target * eased);
        counter.textContent = formatCount(value);
        if (progressRatio < 1) window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
      counterObserver.unobserve(counter);
    });
  }, { threshold: 0.65 });

  document.querySelectorAll("[data-counter]").forEach((counter) => counterObserver.observe(counter));

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((item) => item.classList.toggle("active", item === button));

      projectCards.forEach((card) => {
        const tags = card.dataset.tags.split(" ");
        const visible = filter === "all" || tags.includes(filter);
        card.classList.toggle("is-hidden", !visible);
        if (visible) visibleCount += 1;
      });

      emptyProjects.hidden = visibleCount !== 0;
    });
  });

  const magneticTargets = Array.from(document.querySelectorAll(".magnetic"));
  magneticTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  const tiltCards = Array.from(document.querySelectorAll(".tilt-card"));
  if (!prefersReducedMotion) {
    tiltCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
        card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  const validateField = (field) => {
    const row = field.closest(".form-row");
    const error = row.querySelector(".field-error");
    let message = "";

    if (field.validity.valueMissing) {
      message = "This field is required.";
    } else if (field.validity.typeMismatch) {
      message = "Please enter a valid email address.";
    } else if (field.validity.tooShort) {
      message = `Please enter at least ${field.minLength} characters.`;
    }

    row.classList.toggle("invalid", Boolean(message));
    error.textContent = message;
    return !message;
  };

  contactForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-row").classList.contains("invalid")) validateField(field);
    });
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";
    formStatus.className = "form-status";

    const fields = Array.from(contactForm.querySelectorAll("input, textarea"));
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) return;

    const submitButton = contactForm.querySelector(".form-submit");
    submitButton.classList.add("is-loading");
    submitButton.querySelector("span").textContent = "Sending";

    try {
      const response = await fetch("https://usebasin.com/f/c34348ff2d93", {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Form service failed");

      contactForm.reset();
      formStatus.classList.add("success");
      formStatus.textContent = "Your message was sent successfully.";
    } catch (error) {
      formStatus.textContent = "Message could not be sent right now. Please email me directly.";
    } finally {
      submitButton.classList.remove("is-loading");
      submitButton.querySelector("span").textContent = "Send Message";
    }
  });

  const typeLoop = () => {
    if (prefersReducedMotion || !typingText) return;
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const phrase = phrases[phraseIndex];
      typingText.textContent = phrase.slice(0, charIndex);

      if (!deleting && charIndex < phrase.length) {
        charIndex += 1;
        window.setTimeout(tick, 54);
        return;
      }

      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        window.setTimeout(tick, 1200);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        window.setTimeout(tick, 28);
        return;
      }

      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      window.setTimeout(tick, 200);
    };

    tick();
  };

  typeLoop();

  const initParticles = () => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas || prefersReducedMotion) return;
    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let particles = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(28, Math.floor(width / 28));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.8 + 0.6
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(250, 204, 21, 0.62)";
        context.fill();

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const next = particles[nextIndex];
          const dx = particle.x - next.x;
          const dy = particle.y - next.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(next.x, next.y);
            context.strokeStyle = `rgba(56, 189, 248, ${0.13 * (1 - distance / 120)})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      });

      window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", throttleFrame(resize), { passive: true });
  };

  initParticles();
})();
