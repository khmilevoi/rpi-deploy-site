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
