// "КОРТЫ СЕЙЧАС" — scoreboard of all courts with a day timeline.
import { html, cx } from "../../lib/html.js";
import { href } from "../../lib/router.js";
import { courts, OPEN_MIN, CLOSE_MIN } from "../../data/courts.js";
import { liveStatus, dayBlocks, boardClock } from "../../lib/schedule.js";
import { fromMin, pad } from "../../lib/date.js";
import { rub } from "../../lib/format.js";
import { useNow } from "../../hooks/index.js";
import { useStore } from "../../app/store.js";
import { StatusDot } from "../../components/ui.js";
import { Icon } from "../../components/Icon.js";

const SPAN = CLOSE_MIN - OPEN_MIN;
const pct = (m) => ((m - OPEN_MIN) / SPAN) * 100;

function Timeline({ blocks, now }) {
  const hours = [];
  for (let h = 7; h <= 22; h += 3) hours.push(h);
  return html`<div class="tl" aria-hidden="true">
    <div class="tl__track">
      ${blocks.map(
        (b, i) => html`<span key=${i} class=${cx("tl__blk", b.mine && "tl__blk--mine", b.end <= now && "tl__blk--past")} style=${{ left: pct(b.start) + "%", width: pct(b.end) - pct(b.start) + "%" }}></span>`
      )}
      <span class="tl__now" style=${{ left: pct(now) + "%" }}></span>
    </div>
    <div class="tl__hours">${hours.map((h) => html`<span key=${h} style=${{ left: pct(h * 60) + "%" }}>${pad(h)}</span>`)}</div>
  </div>`;
}

export function LiveBoard() {
  const now = useNow(1000);
  const { state } = useStore();
  const clock = boardClock();
  const t = clock.simulated ? fromMin(clock.min) + ":00" : `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return html`<div class="board is-dark" data-reveal>
    <div class="board__bar">
      <div class="board__bar-l">
        <span class="live-tag">LIVE</span>
        <span class="label">Padel 61 · Court status</span>
      </div>
      <div class="board__clock num" aria-label="Время табло">${t}</div>
    </div>
    ${clock.simulated
      ? html`<div class="board__note t-xs">Клуб закрыт — табло показывает типичный вечер завтрашнего дня (демо).</div>`
      : null}
    <div class="board__head label label-sm" aria-hidden="true">
      <span>Court</span><span>Status</span><span class="board__head-tl">07:00 — 22:00</span><span>Up next</span><span></span>
    </div>
    <ul class="board__rows">
      ${courts.map((c, i) => {
        const st = liveStatus(state.bookings, c);
        const blocks = dayBlocks(state.bookings, c.id, clock.date);
        const bookTo = `/booking?court=${c.id}&date=${clock.date}${st.kind === "free" ? `&time=${fromMin(Math.ceil(clock.min / 30) * 30)}` : ""}`;
        return html`<li key=${c.id} class=${cx("brow", "brow--" + st.kind)} style=${{ "--rd": i * 80 + "ms" }}>
          <div class="brow__court">
            <span class="brow__no num">${c.no}</span>
            <span class="brow__name">
              <span class="brow__title">${c.short}</span>
              <span class="label label-sm muted">${c.en} · ${rub(c.price)}/ч</span>
            </span>
          </div>
          <div class="brow__status">
            <span class="brow__state"><${StatusDot} kind=${st.kind === "live" ? "live" : st.kind === "free" ? "free" : "closed"} /> ${st.label}</span>
            <span class="brow__sub t-sm muted">${st.sub}</span>
            ${st.kind === "live" ? html`<span class="brow__prog"><span style=${{ transform: `scaleX(${st.progress})` }}></span></span>` : null}
          </div>
          <div class="brow__tl"><${Timeline} blocks=${blocks} now=${clock.min} /></div>
          <div class="brow__next">
            ${st.next
              ? html`<span class="label label-sm muted">Следующая бронь</span><span class="num brow__next-t">${fromMin(st.next.start)}</span>`
              : html`<span class="label label-sm muted">Дальше</span><span class="brow__next-free">свободно до закрытия</span>`}
          </div>
          <div class="brow__act">
            <a class=${cx("btn btn--sm", st.kind === "free" ? "btn--primary" : "btn--ghost")} href=${href(bookTo)}>
              <span class="btn__label">Забронировать</span><span class="btn__icon"><${Icon} name="arrow" size=${16} /></span>
            </a>
          </div>
        </li>`;
      })}
    </ul>
    <div class="board__legend t-xs">
      <span><i class="lg lg--busy"></i>Занято</span>
      <span><i class="lg lg--mine"></i>Ваша бронь</span>
      <span><i class="lg lg--now"></i>Сейчас</span>
    </div>
  </div>`;
}
