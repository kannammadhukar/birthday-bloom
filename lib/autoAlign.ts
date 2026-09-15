/**
 * Universal Auto-Aligner
 * Smoothly aligns any interactive element or section dead-center in the viewport
 * whenever the user clicks/presses it, even if they were scrolled off-center or misaligned.
 */
export function smoothAlign(
  target: HTMLElement | string | null | undefined,
  block: ScrollLogicalPosition = "center",
  force: boolean = false
) {
  if (typeof window === "undefined" || !target) return;
  try {
    let el: HTMLElement | null = null;
    if (typeof target === "string") {
      const clean = target.replace(/^#/, "");
      el = document.getElementById(clean) || document.querySelector<HTMLElement>(target);
    } else {
      el = target;
    }

    if (!el) return;

    if (force) {
      el.scrollIntoView({ behavior: "smooth", block });
      return;
    }

    // Measure alignment relative to viewport
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;

    // If center distance > 65px or top/bottom is cut off outside screen, glide to center
    const isMisaligned =
      Math.abs(elementCenter - viewportCenter) > 65 ||
      rect.top < 35 ||
      rect.bottom > windowHeight - 25;

    if (isMisaligned) {
      el.scrollIntoView({ behavior: "smooth", block });
    }
  } catch {}
}
