import gsap from "gsap";

export function initIntro() {
  const overlay = document.querySelector<HTMLElement>("#intro-overlay");
  if (!overlay) return;

  const monogram = overlay.querySelector<HTMLImageElement>("#intro-monogram");
  const barFill = overlay.querySelector<HTMLElement>("#intro-bar-fill");

  const finish = () => {
    document.documentElement.classList.remove("intro-active");
    document.documentElement.dataset.introDone = "true";
    overlay.remove();
    window.dispatchEvent(new CustomEvent("intro:complete"));
  };

  if (document.documentElement.dataset.introDone === "true") {
    overlay.remove();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !monogram) {
    finish();
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: "expo.out" },
    onComplete: finish,
  });

  tl.from(monogram, {
    autoAlpha: 0,
    y: 12,
    duration: 0.7,
  })
    .to(
      barFill,
      {
        scaleX: 1,
        duration: 1.05,
        ease: "power1.inOut",
      },
      0,
    )
    .addLabel("exit", 0.95)
    .to(
      monogram,
      {
        autoAlpha: 0,
        y: -12,
        duration: 0.4,
        ease: "power2.in",
      },
      "exit",
    )
    .to(
      overlay,
      {
        yPercent: -100,
        duration: 0.65,
        ease: "expo.inOut",
      },
      "exit+=0.15",
    );
}
