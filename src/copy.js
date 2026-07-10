// orchestrated page-load moment: index terminal lines for the stagger,
// then flip <html> to .loaded so the logo builds and the log streams in.
document.querySelectorAll(".terminal-body .tline").forEach((line, i) => {
  line.style.setProperty("--n", i);
});
requestAnimationFrame(() => {
  document.documentElement.classList.add("loaded");
});

// Nav logo reveal: hidden while the hero is in view; once the hero scrolls up
// past the sticky nav, `past-hero` lets the mark slide in and push the wordmark.
const hero = document.querySelector(".hero");
if (hero && "IntersectionObserver" in window) {
  const navHeight = document.querySelector(".nav")?.offsetHeight ?? 56;
  const io = new IntersectionObserver(
    ([entry]) => {
      document.documentElement.classList.toggle("past-hero", !entry.isIntersecting);
    },
    { root: null, rootMargin: `-${navHeight}px 0px 0px 0px`, threshold: 0 },
  );
  io.observe(hero);
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
    } catch {
      return; // clipboard unavailable (non-secure context) — leave the button as-is
    }
    button.classList.add("copied");
    button.textContent = "✓";
    setTimeout(() => {
      button.classList.remove("copied");
      button.textContent = "⧉";
    }, 1500);
  });
});
