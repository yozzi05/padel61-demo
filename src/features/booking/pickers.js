// Booking building blocks: date strip, court picker, slot grid, duration.
import { html, cx, useEffect, useRef } from "../../lib/html.js";
import { addDays, today, iso, fromIso, weekdayShort, monthShort, fromMin, fmtDuration } from "../../lib/date.js";
import { rub } from "../../lib/format.js";
import { courts } from "../../data/courts.js";
import { freeShare, rangeIsFree } from "../../lib/schedule.js";
import { CourtLines } from "../../components/graphics.js";

export const DAYS = 14;
export const DURATIONS = [60, 90, 120];

export function StepHead({ no, title, value, done, active }) {
  return html`<div class=${cx("step__head", done && "is-done", active && "is-active")}>
    <span class="step__no num">${no}</span>
    <span class="step__title d-h4">${title}</span>
    ${value ? html`<span class="step__value t-sm">${value}</span>` : null}
  </div>`;
}

export function DateStrip({ value, onChange, bookings, courtId }) {
  const ref = useRef(null);
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today(), i));
  useEffect(() => {
    const el = ref.current && ref.current.querySelector(".is-on");
    el && el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [value]);
  return html`<div class="dstrip" ref=${ref} role="listbox" aria-label="Дата">
    ${days.map((d, i) => {
      const id = iso(d);
      const share = courtId ? freeShare(bookings, courtId, id) : courts.reduce((s, c) => s + freeShare(bookings, c.id, id), 0) / courts.length;
      const full = share === 0;
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      return html`<button
        key=${id}
        role="option"
        aria-selected=${value === id}
        class=${cx("dcell", value === id && "is-on", weekend && "is-weekend", full && "is-full")}
        disabled=${full}
        onClick=${() => onChange(id)}
      >
        <span class="dcell__wd label label-sm">${i === 0 ? "Сегодня" : i === 1 ? "Завтра" : weekdayShort(d)}</span>
        <span class="dcell__d num">${d.getDate()}</span>
        <span class="dcell__m t-xs">${monthShort(d)}</span>
        <span class="dcell__bar" title=${`Свободно ${Math.round(share * 100)}%`}><span style=${{ transform: `scaleX(${share})` }}></span></span>
      </button>`;
    })}
  </div>`;
}

export function CourtPicker({ value, onChange, bookings, date }) {
  return html`<div class="cpick">
    ${courts.map((c) => {
      const share = freeShare(bookings, c.id, date);
      return html`<button key=${c.id} class=${cx("cpick__item", value === c.id && "is-on")} aria-pressed=${value === c.id} onClick=${() => onChange(c.id)}>
        <span class="cpick__plan"><${CourtLines} vertical animate=${false} /><span class="cpick__no num">${c.no}</span></span>
        <span class="cpick__info">
          <span class="cpick__name">${c.name}</span>
          <span class="t-xs muted">${c.format} · ${c.roof}</span>
          <span class="cpick__price num">${rub(c.price)}<small>/ч</small></span>
          <span class="cpick__free t-xs">${share === 0 ? "Мест нет" : `Свободно ${Math.round(share * 100)}%`}</span>
        </span>
      </button>`;
    })}
  </div>`;
}

const PARTS = [
  { id: "morning", label: "Утро", from: 7 * 60, to: 12 * 60 },
  { id: "day", label: "День", from: 12 * 60, to: 17 * 60 },
  { id: "evening", label: "Вечер", from: 17 * 60, to: 22 * 60 },
];

export function SlotGrid({ slots, start, duration, onPick }) {
  const inRange = (m) => start != null && m >= start && m < start + duration;
  const ok = start != null && rangeIsFree(slots, start, duration);
  return html`<div class="slots">
    ${PARTS.map(
      (p) => html`<div key=${p.id} class="slots__part">
        <div class="slots__label label label-sm muted">${p.label}</div>
        <div class="slots__grid">
          ${slots
            .filter((s) => s.min >= p.from && s.min < p.to)
            .map((s) => {
              const sel = inRange(s.min);
              const disabled = s.state !== "free";
              return html`<button
                key=${s.min}
                class=${cx("slot", "slot--" + s.state, sel && "is-sel", sel && !ok && "is-conflict", s.min === start && "is-start")}
                disabled=${disabled && !sel}
                aria-pressed=${s.min === start}
                aria-label=${`${s.label} — ${{ free: "свободно", busy: "занято", past: "прошло", mine: "ваша бронь" }[s.state]}`}
                onClick=${() => !disabled && onPick(s.min)}
              >
                <span class="slot__t">${s.label}</span>
                ${s.state === "mine" ? html`<span class="slot__tag">ваша</span>` : null}
              </button>`;
            })}
        </div>
      </div>`
    )}
  </div>`;
}

export function DurationPicker({ value, onChange, slots, start, price }) {
  return html`<div class="seg" role="radiogroup" aria-label="Продолжительность">
    ${DURATIONS.map((d) => {
      const free = start == null || rangeIsFree(slots, start, d);
      return html`<button key=${d} role="radio" aria-checked=${value === d} class=${cx("seg__btn", value === d && "is-on")} disabled=${!free} onClick=${() => onChange(d)}>
        <span>${fmtDuration(d)}</span>
        <small>${free ? rub((price * d) / 60) : "занято"}</small>
      </button>`;
    })}
  </div>`;
}

export const endLabel = (start, duration) => fromMin(start + duration);
export const dayLabel = (id) => {
  const d = fromIso(id);
  return `${weekdayShort(d)}, ${d.getDate()} ${monthShort(d)}`;
};
