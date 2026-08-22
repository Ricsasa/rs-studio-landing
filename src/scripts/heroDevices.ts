import gsap from "gsap";

const DWELL = 4.6;

const FADE = 0.7;

export function initHeroDevices() {
  const root = document.querySelector<HTMLElement>("#hero-devices");
  if (!root) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const screen = root.querySelector<HTMLElement>("#hero-screen");
  const phone = root.querySelector<HTMLElement>("#hero-phone");

  if (!screen || !phone) return;

  gsap.set([screen, phone], { autoAlpha: 0 });
  gsap.set(screen, { y: 24 });
  gsap.set(phone, { y: 32, x: -12 });

  const assemble = () => {
    gsap
      .timeline({ defaults: { ease: "expo.out" } })
      .to(screen, { autoAlpha: 1, y: 0, duration: 0.9 })
      .to(phone, { autoAlpha: 1, y: 0, x: 0, duration: 0.9 }, "-=0.65");
  };

  const overflow = (frame: HTMLElement) => () => {
    const window_ = frame.parentElement;
    if (!window_) return 0;

    return Math.min(0, window_.clientHeight - frame.clientHeight);
  };

  const cycle = (frames: HTMLElement[], delay: number) => {
    if (frames.length === 0) return;

    const timeline = gsap.timeline({ repeat: -1, delay });

    if (frames.length === 1) {
      timeline.fromTo(
        frames[0]!,
        { y: 0 },
        { y: overflow(frames[0]!), duration: DWELL * 2, ease: "none", yoyo: true, repeat: 1 },
      );

      return;
    }

    frames.forEach((frame, index) => {
      const next = frames[(index + 1) % frames.length]!;
      const start = index * DWELL;

      timeline
        .fromTo(
          frame,
          { y: 0 },
          { y: overflow(frame), duration: DWELL + FADE, ease: "none" },
          start,
        )
        .to(frame, { autoAlpha: 0, duration: FADE, ease: "power1.inOut" }, start + DWELL)
        .to(next, { autoAlpha: 1, duration: FADE, ease: "power1.inOut" }, start + DWELL);
    });
  };

  let started = false;

  const start = () => {
    if (started) return;
    started = true;

    assemble();

    cycle(gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-screen-frame]")), 1.1);
    cycle(gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-phone-frame]")), 3.4);
  };

  if (document.documentElement.dataset.introDone === "true") {
    start();
    return;
  }

  window.addEventListener("intro:complete", start, { once: true });

  gsap.delayedCall(3, start);
}
