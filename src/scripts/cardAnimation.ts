import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initCardAnimations(scope: ParentNode = document) {
  const cards = gsap
    .utils.toArray<HTMLElement>(scope.querySelectorAll(".gsap-reveal-card"))
    .filter((card) => !card.dataset.cardAnimationInitialized);

  if (!cards.length) return () => {};

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(cards, {
      autoAlpha: 1,
      y: 0,
    });

    return () => {};
  }

  cards.forEach((card) => {
    card.dataset.cardAnimationInitialized = "true";
  });

  // Set the initial state in GSAP instead of relying on a CSS class. Some cards
  // have `transition-all`, so adding a class can make the initial hide/show
  // transition compete with the ScrollTrigger animation.
  gsap.set(cards, {
    autoAlpha: 0,
    y: 40,
  });

  const animations = cards.map((card) =>
    gsap.to(card, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: "power2.out",

      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        once: true,
      },
    }),
  );

  return () => {
    animations.forEach((animation) => animation.kill());
    cards.forEach((card) => {
      delete card.dataset.cardAnimationInitialized;
    });
  };
}
