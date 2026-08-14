import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveals the hero mission line and closing quote as the reader scrolls
 * past the hero. The closing quote reads more subtly than the mission
 * line, so it gets a smaller rise and a lower peak opacity.
 */
export function initHeroCopyReveal() {
  const mission = document.querySelector<HTMLElement>("#hero-mission");
  const closing = document.querySelector<HTMLElement>("#hero-closing");

  if (!mission && !closing) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set([mission, closing].filter(Boolean) as HTMLElement[], {
      opacity: 1,
    });
    return;
  }

  if (mission) {
    gsap.set(mission, { y: 16 });
    gsap.to(mission, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: mission,
        start: "top 85%",
        toggleActions: "play none none none",
        once: true,
      },
    });
  }

  if (closing) {
    gsap.set(closing, { y: 10 });
    gsap.to(closing, {
      opacity: 0.75,
      y: 0,
      duration: 0.9,
      delay: 0.15,
      ease: "power1.out",
      scrollTrigger: {
        trigger: closing,
        start: "top 90%",
        toggleActions: "play none none none",
        once: true,
      },
    });
  }
}
