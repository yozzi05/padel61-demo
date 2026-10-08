// Court-geometry graphics: the visual signature of the product.
import { html, cx, useMemo, useState } from "../lib/html.js";

/** Padel court, top view, real proportions 20 × 10 m. Lines draw in on mount. */
export function CourtLines({ class: cls, vertical, animate = true, net = true, highlight }) {
  const W = vertical ? 100 : 200;
  const H = vertical ? 200 : 100;
  // service lines sit 6.95 m from the net
  const lines = vertical
    ? [
        `M0 0H100V200H0Z`,
        `M0 30.5H100`,
        `M0 169.5H100`,
        `M50 30.5V169.5`,
      ]
    : [`M0 0H200V100H0Z`, `M30.5 0V100`, `M169.5 0V100`, `M30.5 50H169.5`];
  const netPath = vertical ? `M-4 100H104` : `M100 -4V104`;
  return html`<svg class=${cx("court-lines", animate && "court-lines--draw", cls)} viewBox=${`-2 -2 ${W + 4} ${H + 4}`} preserveAspectRatio="none" aria-hidden="true">
    ${highlight
      ? html`<rect class="court-lines__hl" x=${highlight.x} y=${highlight.y} width=${highlight.w} height=${highlight.h} />`
      : null}
    ${lines.map((d, i) => html`<path key=${i} d=${d} pathLength="1" style=${{ "--i": i }} vector-effect="non-scaling-stroke" />`)}
    ${net ? html`<path class="court-lines__net" d=${netPath} pathLength="1" style=${{ "--i": 4 }} vector-effect="non-scaling-stroke" />` : null}
  </svg>`;
}

export function Logo({ class: cls, compact }) {
  return html`<span class=${cx("logo", cls)} aria-label="Padel 61">
    <span class="logo__word">PADEL</span>
    <span class="logo__num">61</span>
    ${compact ? null : html`<span class="logo__sub">Rostov-on-Don</span>`}
  </span>`;
}

export function Marquee({ items, dark, class: cls }) {
  const row = html`${items.map((t, i) => html`<span key=${i} class="marquee__item">${t}<i class="marquee__sep" aria-hidden="true"></i></span>`)}`;
  return html`<div class=${cx("marquee", dark && "marquee--dark", cls)} aria-hidden="true">
    <div class="marquee__track">${row}${row}</div>
  </div>`;
}

/** Rating line chart with hover readout. */
export function RatingChart({ data, height = 220, dark, labels }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = height;
  const pad = { t: 16, r: 12, b: 28, l: 44 };
  const { pts, min, max, ticks } = useMemo(() => {
    const lo = Math.floor((Math.min(...data) - 20) / 50) * 50;
    const hi = Math.ceil((Math.max(...data) + 20) / 50) * 50;
    const x = (i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
    const tk = [];
    for (let v = lo; v <= hi; v += 50) tk.push({ v, y: y(v) });
    return { pts: data.map((v, i) => ({ x: x(i), y: y(v), v })), min: lo, max: hi, ticks: tk };
  }, [data, H]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x} ${H - pad.b} L${pts[0].x} ${H - pad.b} Z`;
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rel = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    pts.forEach((p, i) => {
      if (Math.abs(p.x - rel) < Math.abs(pts[best].x - rel)) best = i;
    });
    setHover(best);
  };
  const hp = hover != null ? pts[hover] : pts[pts.length - 1];
  return html`<div class=${cx("rchart", dark && "rchart--dark")}>
    <svg viewBox=${`0 0 ${W} ${H}`} class="rchart__svg" onMouseMove=${onMove} onMouseLeave=${() => setHover(null)} role="img" aria-label=${`График рейтинга: от ${data[0]} до ${data[data.length - 1]}`}>
      ${ticks.map((t) => html`<g key=${t.v}><line x1=${pad.l} x2=${W - pad.r} y1=${t.y} y2=${t.y} class="rchart__grid" /><text x=${pad.l - 10} y=${t.y + 4} class="rchart__tick" text-anchor="end">${t.v}</text></g>`)}
      <path d=${area} class="rchart__area" />
      <path d=${line} class="rchart__line" pathLength="1" />
      <line x1=${hp.x} x2=${hp.x} y1=${pad.t} y2=${H - pad.b} class="rchart__cursor" />
      <rect x=${hp.x - 5} y=${hp.y - 5} width="10" height="10" class="rchart__dot" />
      ${(labels || []).map((l, i) => html`<text key=${i} x=${pts[l.i].x} y=${H - 8} class="rchart__tick" text-anchor=${l.i === 0 ? "start" : l.i === data.length - 1 ? "end" : "middle"}>${l.text}</text>`)}
    </svg>
    <div class="rchart__readout">
      <span class="label muted">${hover == null ? "Сейчас" : `${data.length - 1 - hover} нед. назад`}</span>
      <span class="num rchart__val">${hp.v}</span>
    </div>
  </div>`;
}

/** Tiny sparkline (leaderboard rows) */
export function Spark({ data, w = 84, h = 24 }) {
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const d = data
    .map((v, i) => `${i ? "L" : "M"}${((i / (data.length - 1)) * w).toFixed(1)} ${(h - 2 - ((v - lo) / (hi - lo || 1)) * (h - 4)).toFixed(1)}`)
    .join(" ");
  const up = data[data.length - 1] >= data[0];
  return html`<svg class=${"spark " + (up ? "spark--up" : "spark--down")} width=${w} height=${h} viewBox=${`0 0 ${w} ${h}`} aria-hidden="true"><path d=${d} /></svg>`;
}
