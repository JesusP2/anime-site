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

  const transition = document.startViewTransition(() => {});
  try {
    await transition.ready;

    const duration = 10_000;
    const easing = "ease-in-out";
    const scaleDown = "scale(0.85)";

    const oldPageKeyframes = [
      { transform: "scale(1)", offset: 0 },
      { transform: scaleDown, offset: 0.1 },
      { transform: `translateX(-100%) ${scaleDown}`, offset: 1 },
    ];

    const newPageKeyframes = [
      { transform: `translateX(100%) ${scaleDown}`, offset: 0 },
      { transform: `translateX(0) ${scaleDown}`, offset: 0.9 },
      { transform: "translateX(0) scale(1)", offset: 1 },
    ];

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

    await transition.finished;
  } finally {
    document.querySelectorAll("[data-saved-transition]").forEach((_el) => {
      const el = _el as HTMLElement;
      el.style.viewTransitionName = el.dataset.savedTransition as string;
      delete el.dataset.savedTransition;
    });
  }
}
