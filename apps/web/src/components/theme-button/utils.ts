export function setTheme(
  isDarkMode: boolean,
  cb: (isDarkMode: boolean) => void,
) {
  cb(isDarkMode);
  document.documentElement.classList[isDarkMode ? "add" : "remove"]("dark");
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `theme=${isDarkMode ? "dark" : "light"}; path=/; max-age=${maxAge}`;
}

export async function toggleTheme(
  isDarkMode: boolean,
  el: HTMLLabelElement | null,
  cb: (isDarkMode: boolean) => void,
) {
  if (!document.startViewTransition || !el) {
    setTheme(isDarkMode, cb);
    return;
  }
  document
    .querySelectorAll('[style*="view-transition-name"]')
    .forEach((_el) => {
      const el = _el as HTMLElement;
      el.dataset.savedTransition = el.style.viewTransitionName;
      el.style.viewTransitionName = "";
    });

  const { left, top, width, height } = el.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const diagonal = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
  const duration = diagonal / 2;

  const transition = document.startViewTransition(() => {
    setTheme(isDarkMode, cb);
  });
  try {
    await transition.ready;
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${diagonal}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
    await transition.finished;
  } catch (err) {
    console.error(err);
  } finally {
    document.querySelectorAll("[data-saved-transition]").forEach((_el) => {
      const el = _el as HTMLElement;
      el.style.viewTransitionName = el.dataset.savedTransition as string;
      delete el.dataset.savedTransition;
    });
  }
}
