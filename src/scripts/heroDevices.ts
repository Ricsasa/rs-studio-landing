import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Seconds a frame holds before handing over. */
const DWELL = 4.6;

/** Length of the crossfade between two frames. */
const FADE = 0.7;

/**
 * The hero device composition.
 *
 * Four behaviours, deliberately kept apart: the devices assemble once on entry,
 * each screen then cycles through real client work, the visible frame pans
 * inside its window the way the real page would scroll, and the two devices
 * drift at different rates as the reader leaves the hero.
 *
 * Nothing here runs under `prefers-reduced-motion` — the markup already paints
 * the first frame of each device, so the reduced path is to leave it alone.
 */
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

  /**
   * Pans a frame from its top edge to its bottom edge inside the window.
   *
   * The captures are full-page shots in a window cropped to the device's
   * shape, so the overflow is exactly how far there is to travel. Measured in
   * a function rather than up front, so a resize — or an image that decodes
   * late — re-reads it instead of reusing a distance from first paint.
   */
  const overflow = (frame: HTMLElement) => () => {
    const window_ = frame.parentElement;
    if (!window_) return 0;

    return Math.min(0, window_.clientHeight - frame.clientHeight);
  };

  /**
   * Crossfades a stack of frames forever, panning whichever one is showing.
   *
   * With a single frame there is nothing to cross to, so it just pans. The
   * pan runs slightly longer than the dwell so it is still moving underneath
   * the fade rather than parking before it.
   */
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

  /**
   * Hero parallax: the composition leaves slower than the page does.
   *
   * Everything is pulled *down* as the reader scrolls up, which nets out at
   * roughly 70% of scroll speed. Measured in pixels rather than percent so the
   * copy and the devices lag by the same distance and the split stays square —
   * a percentage would tie each element's lag to its own height and shear the
   * two columns apart.
   *
   * The rate is read from `--hero-lag` rather than written here: the section's
   * min-height is padded by the same fraction, and the two have to move
   * together or the lag drags the composition over the section boundary.
   *
   * `ease: "none"`: position is driven by scroll, not by time.
   */
  const parallax = () => {
    const section = root.closest("section");
    if (!section) return;

    const targets = [root, section.querySelector("#hero-copy")].filter(Boolean);

    const lag = () =>
      parseFloat(getComputedStyle(section).getPropertyValue("--hero-lag")) || 0;

    gsap.to(targets, {
      // Resolved per refresh against the live section height, so the lag is
      // the same fraction of the scroll on a laptop and on a tall monitor.
      y: () => section.offsetHeight * lag(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        // The hero is already in view at load; the scrub has to begin where it
        // starts leaving, not on entry, or it opens mid-tween.
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
  };

  let started = false;

  const start = () => {
    if (started) return;
    started = true;

    assemble();
    parallax();

    // Offset the two cycles so the devices never change frame in lockstep.
    cycle(gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-screen-frame]")), 1.1);
    cycle(gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-phone-frame]")), 3.4);
  };

  // The intro overlay owns the first ~1.5s of the page; starting underneath it
  // would spend the animation behind a full-screen sheet. `introDone` is set
  // synchronously when the overlay is skipped, so check it before listening.
  if (document.documentElement.dataset.introDone === "true") {
    start();
    return;
  }

  window.addEventListener("intro:complete", start, { once: true });

  // Fallback: if the overlay is ever removed without announcing itself, the
  // hero must not sit invisible. `start` is idempotent, so this can fire
  // unconditionally rather than trying to read the current state back.
  gsap.delayedCall(3, start);
}
