// Shared UI primitives.
import { html, cx, useEffect, useRef } from "../lib/html.js";
import { href } from "../lib/router.js";
import { Icon } from "./Icon.js";
import { initials } from "../lib/format.js";
import { hash } from "../lib/random.js";
import { useCountUp } from "../hooks/index.js";

/* ── Button ─────────────────────────────────────────── */
// variant: primary (lime) | dark | ghost | light | text ; size: md | lg | sm
export function Button({ to, onClick, variant = "primary", size = "md", icon = "arrow", iconLeft, children, disabled, loading, type = "button", block, class: cls, ...rest }) {
  const c = cx("btn", `btn--${variant}`, `btn--${size}`, block && "btn--block", loading && "is-loading", cls);
  const inner = html`
    ${iconLeft ? html`<${Icon} name=${iconLeft} size=${18} />` : null}
    <span class="btn__label">${children}</span>
    ${icon && !loading ? html`<span class="btn__icon"><${Icon} name=${icon} size=${18} /></span>` : null}
    ${loading ? html`<span class="spinner" aria-hidden="true"></span>` : null}
  `;
  if (to && !disabled) return html`<a class=${c} href=${href(to)} ...${rest}>${inner}</a>`;
  return html`<button class=${c} type=${type} onClick=${onClick} disabled=${disabled || loading} aria-busy=${loading ? "true" : undefined} ...${rest}>${inner}</button>`;
}

/* ── Level badge: square tile, like a court number ─── */
export function LevelBadge({ level, size = "md", class: cls }) {
  const tone = { A: "a", "B+": "b", B: "b", "C+": "c", C: "c", D: "d" }[level] || "d";
  return html`<span class=${cx("lvl", `lvl--${tone}`, `lvl--${size}`, cls)} title=${"Уровень " + level}>${level}</span>`;
}

/* ── Avatar: monogram on a club colour ─────────────── */
const AV_TONES = ["pine", "sand", "ink", "lime", "clay"];
export function Avatar({ name, size = 40, class: cls, ring }) {
  const tone = AV_TONES[hash(name) % AV_TONES.length];
  return html`<span
    class=${cx("avatar", `avatar--${tone}`, ring && "avatar--ring", cls)}
    style=${{ width: size + "px", height: size + "px", fontSize: Math.round(size * 0.36) + "px" }}
    aria-hidden="true"
  >${initials(name)}</span>`;
}

/* ── Status dot (LIVE / free / busy) ───────────────── */
export const StatusDot = ({ kind = "free" }) => html`<span class=${"sdot sdot--" + kind} aria-hidden="true"></span>`;

/* ── Section head: index + label + title ───────────── */
export function SectionHead({ index, label, title, aside, dark, children, class: cls }) {
  return html`<header class=${cx("shead", dark && "shead--dark", cls)}>
    <div class="shead__meta label" data-reveal>
      ${index ? html`<span class="shead__index">${index}</span>` : null}
      <span>${label}</span>
    </div>
    <h2 class="d-h2 shead__title" data-reveal="clip">${title}</h2>
    ${aside ? html`<div class="shead__aside" data-reveal style="--rd:120ms">${aside}</div>` : null}
    ${children}
  </header>`;
}

/* ── Count-up number ───────────────────────────────── */
export function CountUp({ value, format = (n) => Math.round(n).toLocaleString("ru-RU"), class: cls, duration }) {
  const [ref, v] = useCountUp(value, { duration });
  return html`<span ref=${ref} class=${cx("tabular", cls)}>${format(v)}</span>`;
}

/* ── Tabs (underline, like court service line) ─────── */
export function Tabs({ items, value, onChange, class: cls, dark }) {
  return html`<div class=${cx("tabs", dark && "tabs--dark", cls)} role="tablist">
    ${items.map(
      (it) => html`<button
        key=${it.id}
        role="tab"
        aria-selected=${value === it.id}
        class=${cx("tabs__btn", value === it.id && "is-active")}
        onClick=${() => onChange(it.id)}
      >
        ${it.label}${it.count != null ? html`<sup class="tabs__count">${it.count}</sup>` : null}
      </button>`
    )}
  </div>`;
}

/* ── Chips (filters) ───────────────────────────────── */
export function Chips({ items, value, onChange, class: cls, multi }) {
  const isOn = (id) => (multi ? value.includes(id) : value === id);
  return html`<div class=${cx("chips", cls)} role="group">
    ${items.map(
      (it) => html`<button
        key=${it.id}
        class=${cx("chip", isOn(it.id) && "is-on")}
        aria-pressed=${isOn(it.id)}
        onClick=${() => onChange(it.id)}
      >${it.label}</button>`
    )}
  </div>`;
}

/* ── Empty state ───────────────────────────────────── */
export function Empty({ title, text, action, icon = "court", dark }) {
  return html`<div class=${cx("empty", dark && "empty--dark")}>
    <div class="empty__mark"><${Icon} name=${icon} size=${28} /></div>
    <div class="d-h4">${title}</div>
    ${text ? html`<p class="muted t-sm">${text}</p>` : null}
    ${action || null}
  </div>`;
}

/* ── Skeleton rows (loading state) ─────────────────── */
export const Skeleton = ({ rows = 3, h = 56 }) =>
  html`<div class="skeleton" aria-busy="true" aria-label="Загрузка">
    ${Array.from({ length: rows }, (_, i) => html`<div key=${i} class="skeleton__row" style=${{ height: h + "px" }}></div>`)}
  </div>`;

/* ── Modal / bottom sheet ──────────────────────────── */
export function Modal({ open, onClose, title, children, wide, dark }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    document.body.style.overflow = "hidden";
    const on = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    setTimeout(() => ref.current && ref.current.focus(), 30);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", on);
      prev && prev.focus && prev.focus();
    };
  }, [open]);
  if (!open) return null;
  return html`<div class="modal" onClick=${(e) => e.target === e.currentTarget && onClose()}>
    <div class=${cx("modal__panel", wide && "modal__panel--wide", dark && "is-dark")} role="dialog" aria-modal="true" aria-label=${title} tabindex="-1" ref=${ref}>
      <div class="modal__head">
        <div class="d-h4">${title}</div>
        <button class="iconbtn" onClick=${onClose} aria-label="Закрыть"><${Icon} name="close" /></button>
      </div>
      <div class="modal__body">${children}</div>
    </div>
  </div>`;
}

/* ── Form field ────────────────────────────────────── */
export function Field({ label, hint, error, children }) {
  return html`<label class=${cx("field", error && "has-error")}>
    <span class="field__label label">${label}</span>
    ${children}
    ${error ? html`<span class="field__error t-xs">${error}</span>` : hint ? html`<span class="field__hint t-xs muted">${hint}</span>` : null}
  </label>`;
}

/* ── Progress bar (XP etc) ─────────────────────────── */
export const Meter = ({ value, max, dark, label }) =>
  html`<div class=${cx("meter", dark && "meter--dark")} role="progressbar" aria-valuenow=${value} aria-valuemin="0" aria-valuemax=${max} aria-label=${label}>
    <span class="meter__fill" style=${{ "--p": Math.min(1, value / max) }}></span>
  </div>`;

/* ── Form: W/L squares ─────────────────────────────── */
export const Form = ({ form }) =>
  html`<span class="form" aria-label=${"Последние матчи: " + form.join(" ")}>
    ${form.map((r, i) => html`<span key=${i} class=${"form__sq form__sq--" + r}>${r === "W" ? "W" : "L"}</span>`)}
  </span>`;
