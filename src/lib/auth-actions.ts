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
  const videoForward =
    document.querySelector<HTMLMediaElement>("#video-forward");
  const videoBackward =
    document.querySelector<HTMLMediaElement>("#video-backward");

  if (eyeBtn) {
    const eyeLineIcon = eyeBtn.querySelector(`.eye-line${prefix}`);
    const eyeOffLineIcon = eyeBtn.querySelector(`.eye-off-line${prefix}`);
    const passwordInput = document.querySelector<HTMLInputElement>("#password");
    let firstClick = true;
    eyeBtn?.addEventListener("click", () => {
      if (!eyeLineIcon || !eyeOffLineIcon || !passwordInput) return;
      eyeLineIcon.classList.toggle("hidden");
      eyeOffLineIcon.classList.toggle("hidden");
      if (videoForward && videoBackward) {
        if (passwordInput.type === "password") {
          if (!firstClick) {
            const startTime = Math.max(0, 2 - videoBackward.currentTime);
            videoForward.currentTime = startTime;
          }
          if (firstClick) {
            firstClick = false;
          }

          setTimeout(() => {
            videoForward.classList.remove("opacity-0");
            videoBackward.classList.add("opacity-0");
            videoForward.play();
          }, 50);
        } else {
          const startTime = Math.max(0, 2 - videoForward.currentTime);
          videoBackward.currentTime = startTime;
          setTimeout(() => {
            videoForward.classList.add("opacity-0");
            videoBackward.classList.remove("opacity-0");
            videoBackward.play();
          }, 50);
        }
      }
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
    });
  }
}
