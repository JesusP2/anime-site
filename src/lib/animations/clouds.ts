export function createCloudAnimations(
  clouds1: NodeListOf<Element>,
  clouds2: NodeListOf<Element>,
) {
  const cloudKeyframes1 = [
    { transform: "translate(0%, 0px)" },
    { transform: "translate(25%, -50px)", offset: 0.25 },
    { transform: "translate(50%, -0px)", offset: 0.5 },
    { transform: "translate(75%, -50px)", offset: 0.75 },
    { transform: "translate(100%, 0px)" },
  ];

  const cloudKeyframes2 = [
    { transform: "translate(-100%, 0px)" },
    { transform: "translate(-75%, -50px)", offset: 0.25 },
    { transform: "translate(-50%, 0px)", offset: 0.5 },
    { transform: "translate(-25%, -50px)", offset: 0.75 },
    { transform: "translate(0%, 0px)" },
  ];

  const cloudTiming = {
    duration: 240_000,
    iterations: Infinity,
    easing: "linear"
  };

  clouds1.forEach((cloud) => {
    cloud.animate(cloudKeyframes1, cloudTiming);
  });
  clouds2.forEach((cloud) => {
    cloud.animate(cloudKeyframes2, cloudTiming);
  });
}
