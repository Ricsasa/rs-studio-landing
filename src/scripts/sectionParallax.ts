import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Plate parallax for the sections below the hero.
 *
 * Each plate is crossed rather than landed on, so its content is offset by
 * half the drift on the way in and half on the way out — dead centre, and
 * therefore exactly as composed, at the moment the plate is centred on screen.
 * That is what keeps this from reading as a layout bug on a short viewport:
 * standing still, nothing has moved.
 *
 * The organic field is deliberately left out of it. Drifting the colour would
 * be the obvious depth cue, but the drops are laid out to clear their plate's
 * edges by as little as 2% of its height, and the clip is what makes them read
 * as flat printed ink — travel of any useful size cuts a straight edge through
 * a curve. Holding them still against lagging type gives the same separation
 * for free. The distance comes from `--section-lag`, the token that also pays
 * for the run-out padding in `parallax-plate`.
 *
 * Nothing runs under `prefers-reduced-motion` — the plates are already in
 * their composed position, so the reduced path is to leave them there.
 */
export function initSectionParallax(scope: ParentNode = document) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const plates = gsap.utils.toArray<HTMLElement>(
    scope.querySelectorAll("[data-parallax-plate]"),
  );

  plates.forEach((plate) => {
    const content = plate.querySelector<HTMLElement>("[data-parallax-content]");

    if (!content) return;

    /*
     * Measured against the viewport, not the plate: the drift should feel the
     * same crossing a four-item grid and a six-step list. Read per refresh so
     * a resize — or a rotation — re-derives it instead of holding a distance
     * from first paint.
     */
    const drift = () =>
      window.innerHeight *
      (parseFloat(getComputedStyle(plate).getPropertyValue("--section-lag")) || 0);

    const track = gsap.timeline({
      scrollTrigger: {
        trigger: plate,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    track.fromTo(content, { y: () => -drift() / 2 }, { y: () => drift() / 2 }, 0);
  });
}
