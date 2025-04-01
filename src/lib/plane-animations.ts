const DESIGN_WINDOW_WIDTH = 1900;
const DESIGN_MAX_TOP = 600;
const screenWidth = window.innerWidth; // Get screen width for responsive movement

const defaultConfig = {
  planeWidth: 250,
  totalDistance: screenWidth + 100,
  durationMovement: 13_000,
  frameTime: 1_000 / 24,
  minLoopDelay: 3_000,
  maxLoopDelay: 10_000,
};

type Config = {
  planeWidth: number;
  totalDistance: number;
  durationMovement: number;
  frameTime: number;
  minLoopDelay: number;
  maxLoopDelay: number;
};
function calculateMaxTop() {
  const resizeRatio = window.innerWidth / DESIGN_WINDOW_WIDTH;
  return Math.max(50, resizeRatio * DESIGN_MAX_TOP);
}

export function createPlaneAnimations(
  plane: HTMLElement | null,
  direction: "left" | "right",
  config?: Partial<Config>,
) {
  if (!config) config = defaultConfig;
  const {
    planeWidth,
    totalDistance,
    durationMovement,
    frameTime,
    minLoopDelay,
    maxLoopDelay,
  }: Config = {
    ...defaultConfig,
    ...config,
  };
  const planeHeight = (280 / 810) * planeWidth;
  // plane can be null but typescript is not removing it for some reason
  if (!plane) return;
  plane.style.height = `${planeHeight}px`;
  plane.style.width = `${planeWidth}px`;
  if (direction === "left") {
    plane.style.left = `-${planeWidth}px`;
  } else {
    plane.style.left = `-${planeWidth}px`;
  }
  const movementKeyframes = getKeyFrames(direction, {
    planeWidth,
    totalDistance,
  });

  const movementTiming = {
    duration: durationMovement,
    iterations: 1, // Run only once per call
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
        // Handle potential errors like animation cancellation
        if (e.name !== "AbortError") {
          console.error("Movement animation failed:", e);
        }
      });
  }

  const swapKeyframes = getBladeSwapKeyframes(direction);
  const swapTiming = {
    duration: frameTime * 2,
    iterations: Infinity, // Keep this running continuously
    easing: "steps(2, start)",
  };
  plane.animate(swapKeyframes, swapTiming);
  const delay = calculateDelay(maxLoopDelay, minLoopDelay);
  setTimeout(runMovement, delay);
}

function getKeyFrames(
  movement: "left" | "right",
  config: Pick<Config, "planeWidth" | "totalDistance">,
) {
  if (movement === "right") {
    const offset1 = (screenWidth * 0.25) / config.totalDistance;
    const offset2 = (screenWidth * 0.5) / config.totalDistance;
    const offset3 = (screenWidth * 0.75) / config.totalDistance;
    const offset4 = screenWidth / config.totalDistance;

    const movementKeyframes = [
      // Start off-screen left
      { transform: `translate(0px, -50%)`, offset: 0 },
      // Move across the screen with vertical wave motion
      {
        transform: `translate(${screenWidth * 0.25}px, -40%)`,
        offset: offset1,
      },
      {
        transform: `translate(${screenWidth * 0.5}px, -60%)`,
        offset: offset2,
      },
      {
        transform: `translate(${screenWidth * 0.75}px, -40%)`,
        offset: offset3,
      },
      {
        transform: `translate(${screenWidth}px, -50%)`,
        offset: offset4,
      },
      // End off-screen right
      { transform: `translate(${config.totalDistance}px, -50%)`, offset: 1 },
    ];
    return movementKeyframes;
  }
  const offset1 = config.planeWidth / config.totalDistance; // Distance from right edge to screen edge
  const offset2 =
    (config.planeWidth + screenWidth * 0.25) / config.totalDistance;
  const offset3 =
    (config.planeWidth + screenWidth * 0.5) / config.totalDistance;
  const offset4 =
    (config.planeWidth + screenWidth * 0.75) / config.totalDistance;

  const movementKeyframes = [
    // Start off-screen right
    { transform: `translate(${config.totalDistance}px, -50%)`, offset: 0 },
    // Move across the screen (right-to-left) with vertical wave motion
    { transform: `translate(${screenWidth}px, -40%)`, offset: offset1 }, // Reached left edge of screen
    {
      transform: `translate(${screenWidth * 0.75}px, -60%)`,
      offset: offset2,
    },
    {
      transform: `translate(${screenWidth * 0.5}px, -40%)`,
      offset: offset3,
    },
    {
      transform: `translate(${screenWidth * 0.25}px, -50%)`,
      offset: offset4,
    },
    // End off-screen left (back to original CSS position)
    { transform: `translate(0px, -50%)`, offset: 1 },
  ];
  return movementKeyframes;
}

function getBladeSwapKeyframes(direction: "left" | "right") {
  if (direction === "left") {
    return [
      { backgroundImage: 'url("/plane-left-1.png")' },
      { backgroundImage: 'url("/plane-left-2.png")' },
    ];
  }
  return [
    { backgroundImage: 'url("/plane-right-1.png")' },
    { backgroundImage: 'url("/plane-right-2.png")' },
  ];
}

function calculateDelay(maxLoopDelay: number, minLoopDelay: number) {
  return Math.random() * (maxLoopDelay - minLoopDelay) + minLoopDelay;
}
