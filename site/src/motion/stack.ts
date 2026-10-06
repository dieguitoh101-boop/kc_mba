import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HOLD = 0.4;

export function initStack(reduce: boolean) {
  const units = [...document.querySelectorAll<HTMLElement>("[data-stack]")];
  units.forEach((el, i) => {
    el.style.zIndex = String(10 + i);
  });
  if (reduce || units.length < 2) return () => {};

  const made: ScrollTrigger[] = [];
  const shades: HTMLElement[] = [];
  const held: HTMLElement[] = [];
  const vh = window.innerHeight;

  units.forEach((unit, i) => {
    const next = units[i + 1];
    if (!next) return;

    const fills = unit.offsetHeight >= vh * 0.98;
    if (fills) {
      next.style.marginTop = `${HOLD * 100}svh`;
      held.push(next);
    }

    const shade = document.createElement("div");
    shade.className = "stack-shade";
    unit.appendChild(shade);
    shades.push(shade);

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    if (fills) tl.to({}, { duration: HOLD });
    tl.fromTo(shade, { opacity: 0 }, { opacity: 0.5, duration: 1 });

    made.push(
      ScrollTrigger.create({
        trigger: unit,
        start: () => (unit.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"),
        endTrigger: next,
        end: "top top",
        pin: true,
        pinSpacing: false,
        scrub: true,
        animation: tl,
        invalidateOnRefresh: true,
      }),
    );
  });

  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  return () => {
    made.forEach((st) => {
      st.animation?.kill();
      st.kill(true);
    });
    shades.forEach((shade) => shade.remove());
    held.forEach((el) => (el.style.marginTop = ""));
  };
}
