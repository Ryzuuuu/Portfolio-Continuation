import { useEffect } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

// The hero is pinned while the page scrolls one viewport ("the track"). Progress p (0..1)
// along that track drives the whole sequence:
//   0    → .72  camera pushes in until the two closed eyes fill the screen
//   .52  → .80  ink blooms out of both eyes until the screen is black
//   .80  → 1    the ink lifts, revealing the next section rising into place
const ZOOM_END = 0.72;
const INK_START = 0.52;
const INK_FULL = 0.8;
const IMPACT_AT = 0.47; // impact frames fire as the camera locks on, just before the ink
const IMPACT_MS = 420; // the frames play in ~260ms; the shake settles by here
const HUD_IN = [0.02, 0.08];
const HUD_OUT = [0.5, 0.62];

// Ink droplets thrown off as the ink blooms: [x, y, radius] as fractions of vmin from the
// screen centre, and when each one lands.
const DROPLETS = [
  [-0.36, -0.2, 0.024, 0.53],
  [0.33, -0.26, 0.017, 0.55],
  [0.41, 0.13, 0.028, 0.54],
  [-0.29, 0.25, 0.019, 0.56],
  [0.07, 0.34, 0.013, 0.57],
  [-0.47, 0.03, 0.015, 0.58],
];

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const span = (p, start, end) => clamp01((p - start) / (end - start));
const easeIn = (t) => t * t * t;
const easeOut = (t) => 1 - (1 - t) ** 3;

/**
 * Scroll-scrubbed "zoom into the eyes" transition from the hero to the section after it.
 * Everything is written straight to styles/attributes inside one rAF per scroll, so
 * React never re-renders while it plays. Off for reduced motion and old browsers, which
 * keep the plain stacked layout.
 */
export function useEyeZoom(stageRef) {
  useEffect(() => {
    const stage = stageRef.current;
    const pin = stage?.querySelector(".hero-stage__pin");
    const hero = stage?.querySelector(".hero");
    const next = stage?.nextElementSibling;
    if (!stage || !pin || !hero || !next) return undefined;
    if (prefersReducedMotion() || typeof ResizeObserver === "undefined") return undefined;

    const readout = stage.querySelector("[data-zoom-readout]");
    const inkEyes = [...stage.querySelectorAll("[data-ink-eye]")];
    const droplets = [...stage.querySelectorAll("[data-ink-drop]")];
    const impact = stage.querySelector(".impact");
    let g = null; // measured geometry
    let frame = 0;
    let lastY = window.scrollY;
    let direction = 1;
    let settleTarget = null; // where an automatic finish is heading, while it runs
    let settleTimer = 0;
    let touching = false;
    let lastP = 0;
    let impactArmed = true;
    let impactTimer = 0;

    function measure() {
      hero.style.transform = "";
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const pinH = pin.offsetHeight;
      // A hero taller than the screen (phones) sticks once its bottom reaches the bottom edge.
      const pinTop = Math.min(0, vh - pinH);
      const track = vh;

      stage.dataset.zoom = "on";
      stage.style.height = `${pinH + track}px`;
      stage.style.setProperty("--pin-top", `${pinTop}px`);
      stage.style.setProperty("--vh", `${vh}px`);
      next.style.marginTop = `${-Math.min(pinH, vh)}px`;

      const pinRect = pin.getBoundingClientRect();
      const anchor = (selector) => {
        const rect = hero.querySelector(selector).getBoundingClientRect();
        return { x: rect.left - pinRect.left, y: rect.top - pinRect.top };
      };
      const left = anchor(".portrait-eye--left");
      const right = anchor(".portrait-eye--right");
      const origin = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
      const center = { x: vw / 2, y: vh / 2 - pinTop };
      const eyeGap = Math.hypot(right.x - left.x, right.y - left.y) || 1;

      g = {
        vw,
        vh,
        pinTop,
        track,
        left,
        right,
        origin,
        shift: { x: center.x - origin.x, y: center.y - origin.y },
        // Final zoom: the eyes end up ~60% of the screen apart.
        maxScale: Math.min(14, Math.max(3, (0.6 * Math.min(vw, vh * 1.4)) / eyeGap)),
        reach: Math.hypot(vw, vh),
        stickStart: stage.getBoundingClientRect().top + window.scrollY - pinTop,
      };
      hero.style.transformOrigin = `${origin.x}px ${origin.y}px`;
    }

    const progress = () => (g ? clamp01((window.scrollY - g.stickStart) / g.track) : 0);

    // Measure the eyes from the portrait's settled pose: finish any entrance animation
    // still running (someone scrolled early) and drop the pointer tilt without easing.
    function startZoom() {
      hero.getAnimations({ subtree: true }).forEach((animation) => {
        const end = animation.effect?.getComputedTiming().endTime;
        if (Number.isFinite(end) && animation.playState !== "finished") animation.finish();
      });
      stage.dataset.phase = "zoom";
      stage.classList.add("is-measuring");
      measure();
      stage.classList.remove("is-measuring");
    }

    function render() {
      if (!g) return;
      if (stage.dataset.phase === "rest" && progress() > 0) startZoom();
      const p = progress();
      const z = span(p, 0, ZOOM_END);
      const scale = Math.exp(Math.log(g.maxScale) * z ** 1.7);
      const recenter = easeOut(span(p, 0, ZOOM_END * 0.8));
      const tx = g.shift.x * recenter;
      const ty = g.shift.y * recenter;
      hero.style.transform = p > 0 ? `translate(${tx}px, ${ty}px) scale(${scale})` : "";

      stage.style.setProperty("--zp", p.toFixed(4));
      stage.style.setProperty("--hud", (span(p, ...HUD_IN) * (1 - span(p, ...HUD_OUT))).toFixed(3));
      stage.style.setProperty("--ink-lift", span(p, INK_FULL, 1).toFixed(3));
      stage.dataset.phase = p <= 0 ? "rest" : p < INK_FULL ? "zoom" : p < 1 ? "reveal" : "done";
      next.classList.toggle("is-covered", p < INK_FULL);
      if (readout) readout.textContent = `×${scale.toFixed(1)}`;

      // Ink, in viewport coordinates: where each eye has been carried by the zoom.
      const toScreen = (point) => ({
        x: g.origin.x + tx + scale * (point.x - g.origin.x),
        y: g.origin.y + ty + scale * (point.y - g.origin.y) + g.pinTop,
      });
      const bloom = easeIn(span(p, INK_START, INK_FULL)) * g.reach;
      [g.left, g.right].forEach((eye, index) => {
        const circle = inkEyes[index];
        if (!circle) return;
        const at = toScreen(eye);
        circle.setAttribute("cx", at.x.toFixed(1));
        circle.setAttribute("cy", at.y.toFixed(1));
        circle.setAttribute("r", bloom.toFixed(1));
      });
      // Impact frames fire once per descent, as p crosses the lock-on point. They run on
      // the clock (CSS), not on scroll, so a fast scroll still gets every frame.
      if (p < 0.1) impactArmed = true;
      if (impactArmed && impact && lastP < IMPACT_AT && p >= IMPACT_AT && p < INK_FULL) {
        impactArmed = false;
        const left = toScreen(g.left);
        const right = toScreen(g.right);
        const eyeSize = Math.hypot(right.x - left.x, right.y - left.y) * 0.62;
        impact.style.setProperty("--impact-x", `${((left.x + right.x) / 2).toFixed(1)}px`);
        impact.style.setProperty("--impact-y", `${((left.y + right.y) / 2).toFixed(1)}px`);
        impact.style.setProperty("--impact-reach", `${(g.reach * 2.2).toFixed(0)}px`);
        impact.style.setProperty("--eye-size", `${eyeSize.toFixed(1)}px`);
        impact.style.setProperty("--eye-lx", `${left.x.toFixed(1)}px`);
        impact.style.setProperty("--eye-ly", `${left.y.toFixed(1)}px`);
        impact.style.setProperty("--eye-rx", `${right.x.toFixed(1)}px`);
        impact.style.setProperty("--eye-ry", `${right.y.toFixed(1)}px`);
        stage.classList.remove("is-impact");
        void stage.offsetWidth; // restart the CSS animations
        stage.classList.add("is-impact");
        clearTimeout(impactTimer);
        impactTimer = setTimeout(() => stage.classList.remove("is-impact"), IMPACT_MS);
      }
      lastP = p;

      const vmin = Math.min(g.vw, g.vh);
      droplets.forEach((drop, index) => {
        const [x, y, radius, lands] = DROPLETS[index];
        drop.setAttribute("cx", (g.vw / 2 + x * vmin).toFixed(1));
        drop.setAttribute("cy", (g.vh / 2 + y * vmin).toFixed(1));
        drop.setAttribute("r", (radius * vmin * easeOut(span(p, lands, lands + 0.05))).toFixed(1));
      });
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    }

    // Pausing half-way finishes the move in the direction of travel, so one flick of the
    // wheel or a swipe plays the whole transition. A pause is 140ms without scroll events
    // (scrollend isn't fired reliably for every kind of scroll), never mid-touch.
    function settle() {
      if (settleTarget !== null) {
        if (Math.abs(window.scrollY - settleTarget) < 2) settleTarget = null;
        return;
      }
      const p = progress();
      if (!g || touching || p <= 0.001 || p >= 0.999) return;
      settleTarget = direction > 0 ? g.stickStart + g.track : g.stickStart;
      window.scrollTo({ top: settleTarget, behavior: "smooth" });
    }

    function handleScroll() {
      const y = window.scrollY;
      if (y !== lastY) direction = y > lastY ? 1 : -1;
      lastY = y;
      schedule();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 140);
    }

    // Any input from the visitor takes over from an automatic finish.
    function handleUserInput(event) {
      settleTarget = null;
      if (event.type === "touchstart") touching = true;
      if (event.type === "touchend" || event.type === "touchcancel") {
        touching = false;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(settle, 140);
      }
    }
    const USER_INPUT = ["wheel", "touchstart", "touchend", "touchcancel", "keydown"];

    // Keyboard users tabbing into the next section shouldn't land under the ink.
    function handleFocusIn(event) {
      if (g && next.contains(event.target) && progress() < 1) {
        window.scrollTo({ top: g.stickStart + g.track, behavior: "instant" });
      }
    }

    function refresh() {
      measure();
      render();
    }

    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(pin);
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", handleScroll, { passive: true });
    USER_INPUT.forEach((type) => window.addEventListener(type, handleUserInput, { passive: true }));
    document.addEventListener("focusin", handleFocusIn);
    document.fonts?.ready.then(refresh);
    refresh();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      clearTimeout(impactTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", handleScroll);
      USER_INPUT.forEach((type) => window.removeEventListener(type, handleUserInput));
      document.removeEventListener("focusin", handleFocusIn);
      hero.style.transform = "";
      hero.style.transformOrigin = "";
      stage.removeAttribute("data-zoom");
      stage.classList.remove("is-impact");
      stage.removeAttribute("style");
      next.style.marginTop = "";
      next.classList.remove("is-covered");
    };
  }, [stageRef]);
}
