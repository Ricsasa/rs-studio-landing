import gsap from "gsap";

export function initIntro() {
  const overlay = document.querySelector<HTMLElement>("#intro-overlay");
  if (!overlay) return;

  const monogram = overlay.querySelector<HTMLImageElement>("#intro-monogram");
  const barFill = overlay.querySelector<HTMLElement>("#intro-bar-fill");

  // The hero animation waits on this rather than on a guessed delay, so the two
  // stay in step if the intro's timing ever changes. The flag covers the
  // reduced-motion path, where `finish` runs before the hero can subscribe.
  const finish = () => {
    document.documentElement.classList.remove("intro-active");
    document.documentElement.dataset.introDone = "true";
    overlay.remove();
    window.dispatchEvent(new CustomEvent("intro:complete"));
  };

  // The inline pre-paint script already decided to skip (reduced motion, or an
  // in-session navigation back to this page); just clear the markup away.
  if (document.documentElement.dataset.introDone === "true") {
    overlay.remove();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !monogram) {
    finish();
    return;
  }

  const tl = gsap.timeline({
    // The same curve the scroll reveals use, so the site has one motion voice.
    defaults: { ease: "expo.out" },
    onComplete: finish,
  });

  // A rise into place rather than a scale-up: nothing on this site zooms.
  tl.from(monogram, {
    autoAlpha: 0,
    y: 12,
    duration: 0.7,
  })
    // The progress rule is the only motion carrying the accent colour, so it
    // runs the full length of the hold rather than easing out early.
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
