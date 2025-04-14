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

  const oldIconName = isDarkMode ? "theme-icon-sun" : "theme-icon-moon";
  const newIconName = isDarkMode ? "theme-icon-moon" : "theme-icon-sun";

  const rect = el.getBoundingClientRect();
  const iconCenterX = rect.left + rect.width / 2;

  const screenWidth = window.innerWidth;

  const distanceToRight = screenWidth - iconCenterX;
  const distanceToLeft = iconCenterX;

  const transition = document.startViewTransition(() => {
    setTheme(isDarkMode, cb);
  });

  try {
    await transition.ready;
    const duration = 900;
    const easing = "cubic-bezier(0.76, 0, 0.24, 1)";

    const slideOutRight = [
      { transform: "translate(0, 0) scale(1)", opacity: 1, offset: 0 },
      {
        transform: `translate(${distanceToRight * 0.2}px, 1vh) scale(0.97)`,
        opacity: 0.9,
        offset: 0.2,
      },
      {
        transform: `translate(${distanceToRight * 0.4}px, 3.5vh) scale(0.94)`,
        opacity: 0.8,
        offset: 0.4,
      },
      {
        transform: `translate(${distanceToRight * 0.6}px, 7.5vh) scale(0.91)`,
        opacity: 0.7,
        offset: 0.6,
      },
      {
        transform: `translate(${distanceToRight * 0.8}px, 14.25vh) scale(0.88)`,
        opacity: 0.6,
        offset: 0.8,
      },
      {
        transform: `translate(${distanceToRight}px, 25vh) scale(0.85)`,
        opacity: 0.5,
        offset: 1,
      },
    ];

    const slideInLeft = [
      {
        transform: `translate(-${distanceToLeft + rect.width}px, 25vh) scale(0.85)`,
        opacity: 0.5,
        offset: 0,
      },
      {
        transform: `translate(-${(distanceToLeft + rect.width) * 0.8}px, 14.25vh) scale(0.88)`,
        opacity: 0.6,
        offset: 0.2,
      },
      {
        transform: `translate(-${(distanceToLeft + rect.width) * 0.6}px, 7.5vh) scale(0.91)`,
        opacity: 0.7,
        offset: 0.4,
      },
      {
        transform: `translate(-${(distanceToLeft + rect.width) * 0.4}px, 3.5vh) scale(0.94)`,
        opacity: 0.8,
        offset: 0.6,
      },
      {
        transform: `translate(-${(distanceToLeft + rect.width) * 0.2}px, 1vh) scale(0.97)`,
        opacity: 0.9,
        offset: 0.8,
      },
      { transform: "translate(0, 0) scale(1)", opacity: 1, offset: 1 },
    ];

    const fadeOut = [
      { opacity: 1, offset: 0 },
      { opacity: 0, offset: 1 },
    ];
    const fadeIn = [
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 1 },
    ];

    document.documentElement.animate(slideOutRight, {
      duration,
      easing,
      pseudoElement: `::view-transition-old(${oldIconName})`,
      fill: "forwards",
    });

    document.documentElement.animate(slideInLeft, {
      duration,
      easing,
      pseudoElement: `::view-transition-new(${newIconName})`,
      fill: "forwards",
    });

    document.documentElement.animate(fadeOut, {
      duration,
      easing: "ease-in",
      pseudoElement: "::view-transition-old(root)",
      fill: "forwards",
    });

    document.documentElement.animate(fadeIn, {
      duration,
      easing: "ease-out",
      pseudoElement: "::view-transition-new(root)",
      fill: "forwards",
    });

    document.documentElement.animate(fadeOut, {
      duration,
      pseudoElement: "::view-transition-old(landing-layer-2)",
    });

    document.documentElement.animate(fadeIn, {
      duration,
      pseudoElement: "::view-transition-new(landing-layer-2)",
    });

    document.documentElement.animate(fadeOut, {
      duration,
      pseudoElement: "::view-transition-old(landing-layer-4)",
    });

    document.documentElement.animate(fadeIn, {
      duration,
      pseudoElement: "::view-transition-new(landing-layer-4)",
    });

    document.documentElement.animate(fadeOut, {
      duration,
      pseudoElement: "::view-transition-old(auth-layer-2)",
    });

    document.documentElement.animate(fadeIn, {
      duration,
      pseudoElement: "::view-transition-new(auth-layer-2)",
    });

    document.documentElement.animate(fadeOut, {
      duration,
      pseudoElement: "::view-transition-old(auth-layer-4)",
    });

    document.documentElement.animate(fadeIn, {
      duration,
      pseudoElement: "::view-transition-new(auth-layer-4)",
    });


    await transition.finished;
  } finally {
  }
}
