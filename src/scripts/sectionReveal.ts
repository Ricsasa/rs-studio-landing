import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initSectionReveal() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

  if (!sections.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  sections.forEach((section) => {
    gsap.set(section, { opacity: 0, y: 24 });
    gsap.to(section, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none none",
        once: true,
      },
    });
  });
}
