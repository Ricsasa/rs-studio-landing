import gsap from "gsap";

export function initIntro() {
  const overlay = document.querySelector<HTMLElement>("#intro-overlay");
  if (!overlay) return;

  const monogram = overlay.querySelector<HTMLImageElement>("#intro-monogram");
  // The dot matrix is a separate layer, so it has to leave with the artwork
  // it is printed over rather than fading on its own.
  const plate = [monogram, overlay.querySelector<HTMLElement>("#intro-halftone")].filter(
    (element): element is HTMLElement => element !== null,
  );
  const marks = overlay.querySelectorAll<HTMLElement>(".intro-mark");
  const barFill = overlay.querySelector<HTMLElement>("#intro-bar-fill");

  const finish = () => {
    document.documentElement.classList.remove("intro-active");
    overlay.remove();
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: finish });

  tl.from(plate, {
    autoAlpha: 0,
    scale: 0.86,
    duration: 0.55,
  })
    .from(
      marks,
      {
        autoAlpha: 0,
        duration: 0.4,
        stagger: 0.04,
      },
      0.1,
    )
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
      plate,
      {
        autoAlpha: 0,
        y: -24,
        duration: 0.4,
        ease: "power2.in",
      },
      "exit",
    )
    .to(
      overlay,
      {
        yPercent: -100,
        duration: 0.55,
        ease: "power3.inOut",
      },
      "exit+=0.15",
    );
}
