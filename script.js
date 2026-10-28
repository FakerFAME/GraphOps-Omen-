import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import lottie from "lottie-web";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  prevent: (node) => Boolean(node && node.closest && node.closest("#graphops-workbench")),
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const beeElement = document.querySelector(".bee");
const shadowElement = document.querySelector(".bee-shadow");

lottie.loadAnimation({
  container: beeElement,
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "/bee.json",
});

lottie.loadAnimation({
  container: shadowElement,
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "/bee.json",
});

const BEE_SIZE = 125;
const SHADOW_SIZE = 115;

const flightStartY = -BEE_SIZE - 60;
const flightEndY = window.innerHeight + 50;

const viewportWidth = window.innerWidth;
const horizontalCenter = (viewportWidth - BEE_SIZE) / 2;

const horizontalKeyframes = [
  { progress: 0.0, offset: -0.3 },
  { progress: 0.1, offset: -0.6 },
  { progress: 0.2, offset: -0.15 },
  { progress: 0.28, offset: -0.18 },
  { progress: 0.4, offset: 0.7 },
  { progress: 0.52, offset: 0.3 },
  { progress: 0.58, offset: 0.35 },
  { progress: 0.68, offset: -0.55 },
  { progress: 0.8, offset: -0.8 },
  { progress: 0.9, offset: 0.15 },
  { progress: 1.0, offset: -0.2 },
];

const verticalKeyframes = [
  { progress: 0.0, drop: 0.0 },
  { progress: 0.05, drop: 0.16 },
  { progress: 0.3, drop: 0.34 },
  { progress: 0.6, drop: 0.5 },
  { progress: 0.85, drop: 0.66 },
  { progress: 1.0, drop: 1.0 },
];

const SWAY_REACH = viewportWidth * 0.4;

function sampleKeyframes(keyframes, progress, valueKey) {
  for (let i = 0; i < keyframes.length - 1; i++) {
    const from = keyframes[i];
    const to = keyframes[i + 1];

    if (progress >= from.progress && progress <= to.progress) {
      const segmentProgress =
        (progress - from.progress) / (to.progress - from.progress);
      const eased =
        segmentProgress * segmentProgress * (3 - 2 * segmentProgress);
      return from[valueKey] + (to[valueKey] - from[valueKey]) * eased;
    }
  }
  return keyframes[keyframes.length - 1][valueKey];
}

const SHADOW_OFFSET_X = 40;
const SHADOW_OFFSET_Y = 60;

const shadowCenterX = (BEE_SIZE - SHADOW_SIZE) / 2;
const shadowCenterY = (BEE_SIZE - SHADOW_SIZE) / 2;

function positionBee(progress) {
  const horizontalOffset =
    sampleKeyframes(horizontalKeyframes, progress, "offset") * SWAY_REACH;
  const beeX = horizontalCenter + horizontalOffset;

  const verticalDrop = sampleKeyframes(verticalKeyframes, progress, "drop");
  const beeY = flightStartY + (flightEndY - flightStartY) * verticalDrop;

  const lookAhead = Math.min(1, progress + 0.02);
  const travelDirection =
    sampleKeyframes(horizontalKeyframes, lookAhead, "offset") -
    sampleKeyframes(horizontalKeyframes, progress, "offset");
  const tilt = gsap.utils.clamp(-14, 14, travelDirection * 120);

  gsap.set(beeElement, { x: beeX, y: beeY, rotation: tilt });

  const heightFeel = Math.sin(verticalDrop * Math.PI);

  const shadowX = beeX + shadowCenterX + SHADOW_OFFSET_X * (0.5 + heightFeel);
  const shadowY = beeY + shadowCenterY + SHADOW_OFFSET_Y * (0.6 + heightFeel);

  gsap.set(shadowElement, {
    x: shadowX,
    y: shadowY,
    scale: 1 + heightFeel * 0.15,
    scaleY: 0.5,
    rotation: tilt,
    opacity: 0.5 - heightFeel * 0.2,
    transformOrigin: "50% 100%",
  });
}

positionBee(0);

const flight = { scrollProgress: 0 };

gsap.to(flight, {
  scrollProgress: 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".spotlight",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
  onUpdate: () => positionBee(flight.scrollProgress),
});

window.addEventListener("resize", () => ScrollTrigger.refresh());
