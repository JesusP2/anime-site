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

export function eyeBtnEvent(btn: "1" | "2" = "1") {
  const prefix = btn === "1" ? "" : "-2";
  const eyeBtn = document.querySelector(`.eye-btn${prefix}`);
  const eyeLineIcon = eyeBtn?.querySelector(`.eye-line${prefix}`);
  const eyeOffLineIcon = eyeBtn?.querySelector(`.eye-off-line${prefix}`);
  const frameContainer = document.getElementById("frame-animation") as HTMLElement | null;
  const hiddenFrameContainer = document.getElementById("frame-animation-hidden") as HTMLElement | null;
  const passwordInput = document.querySelector<HTMLInputElement>("#password");
  const totalFrames = 30;
  const frameRate = 15;
  const animationDuration = (totalFrames / frameRate) * 600;

  if (!eyeBtn || !frameContainer || !eyeLineIcon || !eyeOffLineIcon || !passwordInput) return;

  const keyframesForward: {
    backgroundImage: string;
    offset: number;
  }[] = [];
  for (let i = 1; i <= totalFrames; i++) {
    const frameNumber = String(i).padStart(3, "0");
    keyframesForward.push({
      backgroundImage: `url('/frames/frame${frameNumber}.avif')`,
      offset: (i - 1) / (totalFrames - 1),
    });
  }

  const keyframesBackward = [...keyframesForward]
    .reverse()
    .map((keyframe, i) => ({
      ...keyframe,
      offset: i / (totalFrames - 1),
    }));

  const animationOptions: KeyframeAnimationOptions = {
    duration: animationDuration,
    iterations: 1,
    easing: `steps(${totalFrames}, end)`,
    fill: "forwards",
  };

  const runInvisibleAnimation = async () => {
    if (!hiddenFrameContainer) return;
    const invisibleAnimation = hiddenFrameContainer.animate(keyframesForward,{
      ...animationOptions,
      duration: 1_000,
    });
    try {
      await invisibleAnimation.finished;
    } catch (e) {
      if (e instanceof DOMException && e.name !== 'AbortError') {
        console.error("Invisible animation pre-run failed:", e);
      } else if (!(e instanceof DOMException)) {
         console.error("Invisible animation pre-run failed:", e);
      }
    } finally {
      invisibleAnimation.cancel();
    }
  };
  runInvisibleAnimation();

  let forwardAnimation: Animation | null = null;
  let backwardAnimation: Animation | null = null;

  eyeBtn.addEventListener("click", () => {
    eyeLineIcon.classList.toggle("hidden");
    eyeOffLineIcon.classList.toggle("hidden");

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
