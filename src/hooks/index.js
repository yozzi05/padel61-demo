import { useEffect, useRef, useState } from "../lib/html.js";

/** Observe every [data-reveal] in the document; re-scan when `dep` changes (route, tab). */
export function useRevealAll(dep) {
  useEffect(() => {
    // Clip-path reveals are fully clipped (zero visible area), so they are observed via their parent.
    const targets = new Map(); // observed node → reveal nodes
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (targets.get(e.target) || []).forEach((el) => el.classList.add("is-in"));
            targets.delete(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.01 }
    );
    const scan = () =>
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
        const clip = el.dataset.reveal === "clip" || el.dataset.reveal === "wipe";
        const node = clip ? el.parentElement : el;
        const list = targets.get(node);
        if (list) {
          if (!list.includes(el)) list.push(el);
        } else {
          targets.set(node, [el]);
          io.observe(node);
        }
      });
    scan();
    // Late-rendered nodes (tabs, async states)
    const mo = new MutationObserver(scan);
    mo.observe(document.getElementById("app"), { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [dep]);
}

/** Re-render every `ms`. Returns Date. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function useScrolled(offset = 8) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const on = () => setS(window.scrollY > offset);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [offset]);
  return s;
}

/** Animate a number from 0 → value once the element is visible. */
export function useCountUp(value, { duration = 1200, start = true } = {}) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    const el = ref.current;
    let raf;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        setV(value * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    if (!el || !("IntersectionObserver" in window)) {
      run();
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && run(), { threshold: 0.3 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, start]);
  return [ref, v];
}

export function useMedia(query) {
  const [m, setM] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}

/** Subtle parallax: translateY = scroll * factor on the referenced element. */
export function useParallax(factor = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.parentElement.getBoundingClientRect();
        el.style.transform = `translate3d(0, ${(-r.top * factor).toFixed(1)}px, 0)`;
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, [factor]);
  return ref;
}
