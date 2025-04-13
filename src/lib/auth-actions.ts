import { authClient } from "@/lib/auth-client";

export function googleBtnEvent() {
  const googleBtn = document.querySelector("#google-btn");
  googleBtn?.addEventListener("click", async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  });
}

function preloadImages(urls: string[]) {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

export function eyeBtnEvent(btn: "1" | "2" = "1") {
  const prefix = btn === "1" ? "" : "-2";
  const eyeBtn = document.querySelector(`.eye-btn${prefix}`);
  const eyeLineIcon = eyeBtn?.querySelector(`.eye-line${prefix}`);
  const eyeOffLineIcon = eyeBtn?.querySelector(`.eye-off-line${prefix}`);
  const frameContainer = document.getElementById("frame-animation");
  const totalFrames = 96;
  const frameRate = 48;
  const animationDuration = (totalFrames / frameRate) * 1000;

  const frameUrls: string[] = [];
  for (let i = 1; i <= totalFrames; i++) {
    const frameNumber = String(i).padStart(3, "0");
    frameUrls.push(`/frames/frame${frameNumber}.avif`);
  }
  preloadImages(frameUrls);

  if (!eyeBtn || !frameContainer || !eyeLineIcon || !eyeOffLineIcon) return;
  const passwordInput = document.querySelector<HTMLInputElement>("#password");
  const keyframesForward: {
    backgroundImage: string;
    offset: number;
  }[] = [];
  frameUrls.forEach((url, i) => {
    keyframesForward.push({
      backgroundImage: `url('${url}')`, // Use the URL directly
      offset: i / (totalFrames - 1), // Adjusted offset calculation
    });
  });

  const keyframesBackward = [...keyframesForward]
    .reverse()
    .map((keyframe, i) => ({
      ...keyframe,
      offset: i / (totalFrames - 1),
    }));
  let forwardAnimation: Animation | null = null;
  let backwardAnimation: Animation | null = null;

  eyeBtn.addEventListener("click", () => {
    if (!eyeLineIcon || !eyeOffLineIcon || !passwordInput) return;
    eyeLineIcon.classList.toggle("hidden");
    eyeOffLineIcon.classList.toggle("hidden");

    const animationOptions = {
      duration: (totalFrames / frameRate) * 1000,
      iterations: 1,
      easing: `steps(${totalFrames}, end)`,
      fill: "forwards" as FillMode, // Hold the end state visually
    };

    if (passwordInput.type === "password") {
      const startAt = backwardAnimation?.currentTime;
      backwardAnimation?.cancel();
      forwardAnimation = frameContainer.animate(
        keyframesForward,
        animationOptions,
      );
      if (typeof startAt === "number") {
        forwardAnimation.currentTime = animationDuration - startAt;
      } else {
        forwardAnimation.currentTime = 0;
      }
    } else {
      const startAt = (forwardAnimation?.currentTime ?? 0) as number;
      forwardAnimation?.cancel();
      backwardAnimation = frameContainer.animate(
        keyframesBackward,
        animationOptions,
      );
      backwardAnimation.currentTime = animationDuration - startAt;
    }
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  });
}
