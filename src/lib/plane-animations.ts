const DESIGN_WINDOW_WIDTH = 1900;
const DESIGN_MAX_TOP = 600;
const screenWidth = window.innerWidth; // Get screen width for responsive movement

const defaultConfig = {
  frameTime: 1_000 / 24,
  minLoopDelay: 5_000,
  maxLoopDelay: 20_000,
  sizeOptions: [50, 100, 150, 200],
  minDurationMovement: 10_000,
  maxDurationMovement: 20_000,
};

type Config = {
  frameTime: number;
  minLoopDelay: number;
  maxLoopDelay: number;
  sizeOptions: number[];
  minDurationMovement: number;
  maxDurationMovement: number;
};
function calculateMaxTop() {
  const resizeRatio = window.innerWidth / DESIGN_WINDOW_WIDTH;
  return Math.max(50, resizeRatio * DESIGN_MAX_TOP);
}

export function createPlaneAnimations(
  plane: HTMLElement | null,
  direction: "LTR" | "RTL",
  config?: Partial<Config>,
) {
  if (!plane) return;

  const mergedConfig: Config = {
    ...defaultConfig,
    ...config,
  };
  if (screenWidth < 768) {
    mergedConfig.sizeOptions = [50, 100, 150];
  } else if (screenWidth < 1024) {
    mergedConfig.sizeOptions = [50, 100, 150, 200];
  }
  const {
    frameTime,
    minLoopDelay,
    maxLoopDelay,
    sizeOptions,
    minDurationMovement,
    maxDurationMovement,
  } = mergedConfig;
  const planeWidth = sizeOptions[
    Math.floor(Math.random() * sizeOptions.length)
  ] as number;
  const planeHeight = (139 / 404) * planeWidth;
  const minWidth = Math.min(...sizeOptions);
  const maxWidth = Math.max(...sizeOptions);
  let durationMovement = minDurationMovement; // Default to min duration

  if (maxWidth > minWidth) {
    // Normalize the selected width (0 for minWidth, 1 for maxWidth)
    const widthRatio = (planeWidth - minWidth) / (maxWidth - minWidth);
    // Interpolate duration: smaller width (widthRatio closer to 0) -> longer duration (closer to maxDuration)
    durationMovement =
      maxDurationMovement -
      widthRatio * (maxDurationMovement - minDurationMovement);
  }

  plane.style.height = `${planeHeight}px`;
  plane.style.width = `${planeWidth}px`;
  // Set initial vertical alignment
  plane.style.transform = "translateY(-50%)";

  if (direction === "LTR") {
    plane.style.left = `-${planeWidth}px`;
  } else {
    plane.style.left = `${screenWidth}px`;
  }

  const movementKeyframes = getKeyFrames(
    direction === "LTR" ? "RTL" : "LTR",
    planeWidth,
  );

  const movementTiming = {
    duration: durationMovement,
    iterations: 1,
    easing: "linear",
  };

  function runMovement() {
    const movementAnimation = plane?.animate(movementKeyframes, movementTiming);
    const maxTop = calculateMaxTop();
    const randomTop = Math.random() * maxTop;
    if (plane) {
      plane.style.top = `${randomTop}px`;
    }

    movementAnimation?.finished
      .then(() => {
        const delay = calculateDelay(maxLoopDelay, minLoopDelay);
        setTimeout(runMovement, delay);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.error("Movement animation failed:", e);
        }
      });
  }

  const swapKeyframes = getBladeSwapKeyframes(direction);
  const swapTiming = {
    duration: frameTime * 2,
    iterations: Infinity,
    easing: "steps(2, start)",
  };
  plane.animate(swapKeyframes, swapTiming);
  const delay = calculateDelay(maxLoopDelay, minLoopDelay);
  setTimeout(runMovement, delay);
}

function getKeyFrames(
  movement: "LTR" | "RTL", // "left" = RTL movement, "right" = LTR movement
  planeWidth: number,
) {
  const totalHorizontalDistance = screenWidth + planeWidth;

  if (movement === "RTL") {
    const offset1 = (planeWidth + screenWidth * 0.25) / totalHorizontalDistance;
    const offset2 = (planeWidth + screenWidth * 0.5) / totalHorizontalDistance;
    const offset3 = (planeWidth + screenWidth * 0.75) / totalHorizontalDistance;

    const movementKeyframes = [
      {
        left: `-${planeWidth}px`,
        transform: "translateY(-50%)",
        offset: 0,
      },
      {
        left: `${screenWidth * 0.25}px`,
        transform: "translateY(-40%)",
        offset: offset1,
      },
      {
        left: `${screenWidth * 0.5}px`,
        transform: "translateY(-60%)",
        offset: offset2,
      },
      {
        left: `${screenWidth * 0.75}px`,
        transform: "translateY(-40%)",
        offset: offset3,
      },
      { left: `${screenWidth}px`, transform: "translateY(-50%)", offset: 1 },
    ];
    return movementKeyframes;
  }
  const offset1 = (screenWidth * 0.25) / totalHorizontalDistance; // Distance from screenWidth to 0.75*screenWidth
  const offset2 = (screenWidth * 0.5) / totalHorizontalDistance; // Distance from screenWidth to 0.5*screenWidth
  const offset3 = (screenWidth * 0.75) / totalHorizontalDistance; // Distance from screenWidth to 0.25*screenWidth

  const movementKeyframes = [
    { left: `${screenWidth}px`, transform: "translateY(-50%)", offset: 0 },
    {
      left: `${screenWidth * 0.75}px`,
      transform: "translateY(-40%)",
      offset: offset1,
    },
    {
      left: `${screenWidth * 0.5}px`,
      transform: "translateY(-60%)",
      offset: offset2,
    },
    {
      left: `${screenWidth * 0.25}px`,
      transform: "translateY(-40%)",
      offset: offset3,
    },
    // End off-screen left
    {
      left: `-${planeWidth}px`,
      transform: "translateY(-50%)",
      offset: 1,
    },
  ];
  return movementKeyframes;
}

function getBladeSwapKeyframes(direction: "LTR" | "RTL") {
  if (direction === "LTR") {
    return [
      { backgroundImage: 'url("/plane-right-1.png")' },
      { backgroundImage: 'url("/plane-right-2.png")' },
    ];
  }
  return [
    { backgroundImage: 'url("/plane-left-1.png")' },
    { backgroundImage: 'url("/plane-left-2.png")' },
  ];
}

function calculateDelay(maxLoopDelay: number, minLoopDelay: number) {
  return Math.random() * (maxLoopDelay - minLoopDelay) + minLoopDelay;
}
