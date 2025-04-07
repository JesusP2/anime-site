import { navigate } from "astro:transitions/client";

export async function bookAnimation(link: string) {
  if (!document.startViewTransition) {
    navigate(link);
    return;
  }

  document
    .querySelectorAll('[style*="view-transition-name"]')
    .forEach((_el) => {
      const el = _el as HTMLElement;
      el.dataset.savedTransition = el.style.viewTransitionName;
      el.style.viewTransitionName = "";
    });

  // --- Add perspective for 3D effect ---
  const originalPerspective = document.documentElement.style.perspective;
  const originalTransformStyle = document.documentElement.style.transformStyle;
  document.documentElement.style.perspective = "1200px"; // Adjust perspective value as needed
  document.documentElement.style.transformStyle = "preserve-3d";

  // --- Inject temporary styles for the transition ---
  const styleId = "vt-book-flip-style"; // ID to find and remove the style later
  const style = document.createElement("style");
  style.id = styleId;
  // Define base styles for the pseudo-elements
  style.textContent = `
    ::view-transition-old(root) {
      animation: none; /* Disable Astro's default fade */
      backface-visibility: hidden; /* Hide the back when flipped */
      transform-origin: 0% 50%; /* Set flip origin to the LEFT edge */
      z-index: 1; /* Ensure old page is on top */
    }
    ::view-transition-new(root) {
      animation: none; /* Disable Astro's default fade */
      z-index: 0; /* Ensure new page is underneath */
    }
  `;
  document.head.appendChild(style);

  // Start the transition, triggering navigation *inside* the callback
  const transition = document.startViewTransition(() => {
    navigate(link); // Perform the DOM update that causes the transition
  });

  try {
    // Wait for the pseudo-elements (::view-transition-*) to be created
    await transition.ready;

    // --- Animation parameters ---
    const duration = 1_000; // 1 second duration (adjust as needed)
    const easing = "ease-in-out";
    const scaleDown = "scale(0.85)"; // Keep the slight zoom-out effect

    // --- Keyframes for the outgoing (old) page flip ---
    const oldPageKeyframes = [
      { transform: "scale(1) rotateY(0deg)", offset: 0 }, // Start at normal scale
      { transform: `${scaleDown} rotateY(0deg)`, offset: 0.1 }, // Scale down
      { transform: `${scaleDown} rotateY(180deg)`, offset: 0.9 }, // Flip 180 degrees (positive)
      { transform: `${scaleDown} rotateY(180deg)`, offset: 1 }, // Hold flipped state briefly
    ];

    // --- Keyframes for the incoming (new) page reveal ---
    const newPageKeyframes = [
      { transform: scaleDown, offset: 0 }, // Start scaled down (underneath)
      { transform: scaleDown, offset: 0.9 }, // Stay scaled down while old page flips
      { transform: "scale(1)", offset: 1 }, // Scale up to full size
    ];

    // --- Animate the pseudo-elements ---
    document.documentElement.animate(oldPageKeyframes, {
      duration,
      easing,
      pseudoElement: "::view-transition-old(root)",
    });

    document.documentElement.animate(newPageKeyframes, {
      duration,
      easing,
      pseudoElement: "::view-transition-new(root)",
    });

    // Wait for the animations to finish
    await transition.finished;
  } finally {
    // --- Cleanup: Restore original styles and remove temporary elements ---
    document.documentElement.style.perspective = originalPerspective;
    document.documentElement.style.transformStyle = originalTransformStyle;

    // Remove the injected style tag
    const styleElement = document.getElementById(styleId);
    if (styleElement) {
      styleElement.remove();
    }

    document.querySelectorAll("[data-saved-transition]").forEach((_el) => {
      const el = _el as HTMLElement;
      el.style.viewTransitionName = el.dataset.savedTransition as string;
      delete el.dataset.savedTransition;
    });
  }
}
