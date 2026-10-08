import { html, cx, useMemo, useState, useEffect } from "../lib/html.js";
import { useStore } from "../app/store.js";
import { courts, courtById, OPEN_MIN, CLOSE_MIN } from "../data/courts.js";
import { daySlots, rangeIsFree } from "../lib/schedule.js";
import { iso, today, addDays, toMin, fromMin, fmtDuration, nowMin } from "../lib/date.js";
import { rub } from "../lib/format.js";
import { Button } from "../components/ui.js";
import { Icon } from "../components/Icon.js";
import { DateStrip, CourtPicker, SlotGrid, DurationPicker, StepHead, dayLabel, endLabel } from "../features/booking/pickers.js";
import { Checkout } from "../features/booking/Checkout.js";

function defaultDate() {
  // After ~21:00 today has no bookable hour left — start from tomorrow
  return nowMin() > CLOSE_MIN - 60 ? iso(addDays(today(), 1)) : iso(today());
}

export function BookingPage({ query }) {
  const { state, addBooking } = useStore();
  const [date, setDate] = useState(query.date || defaultDate());
  const [courtId, setCourtId] = useState(query.court && courtById(query.court) ? query.court : null);
  const [start, setStart] = useState(query.time ? toMin(query.time) : null);
  const [duration, setDuration] = useState(90);
  const [stage, setStage] = useState("select"); // select | checkout
  const [frozen, setFrozen] = useState(null); // order snapshot while paying

  const court = courtId ? courtById(courtId) : null;
  const slots = useMemo(() => (courtId ? daySlots(state.bookings, courtId, date) : []), [courtId, date, state.bookings]);

  // Drop a start time that is not free on the newly selected day / court
  useEffect(() => {
    if (start == null || !courtId || stage === "checkout") return;
    const s = slots.find((x) => x.min === start);
    if (!s || s.state !== "free") setStart(null);
  }, [slots]);

  // Pick the longest duration that fits after choosing a start time
  const pickStart = (m) => {
    setStart(m);
    if (!rangeIsFree(slots, m, duration)) {
      const fit = [120, 90, 60].find((d) => rangeIsFree(slots, m, d));
      if (fit) setDuration(fit);
    }
  };

  const valid = court && start != null && rangeIsFree(slots, start, duration);
  const conflict = court && start != null && !valid;
  const price = court ? (court.price * duration) / 60 : 0;

  const order = court && start != null && {
    kicker: `Корт ${court.no} · ${court.en}`,
    title: court.name,
    lines: [
      ["Дата", dayLabel(date)],
      ["Время", `${fromMin(start)} — ${endLabel(start, duration)}`],
      ["Продолжительность", fmtDuration(duration)],
      ["Тариф", `${rub(court.price)} / час`],
    ],
    total: price,
  };

  const goPay = () => {
    setFrozen(order);
    setStage("checkout");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const confirm = ({ plan, method, paid }) => {
    const booking = {
      id: "b-" + Date.now().toString(36),
      kind: "court",
      courtId,
      date,
      start: fromMin(start),
      duration,
      price,
      paid,
      plan,
      method,
      status: "upcoming",
      createdAt: iso(today()),
    };
    addBooking(booking);
    return booking;
  };

  if (stage === "checkout" && frozen) {
    return html`<section class="bk-co wrap"><${Checkout} order=${frozen} onBack=${() => setStage("select")} onConfirm=${confirm} /></section>`;
  }

  const stepNow = !court ? 2 : start == null ? 3 : 4;

  return html`
    <section class="ptitle wrap">
      <div class="ptitle__meta"><span class="label">Booking</span><span class="label muted">07:00 — 22:00 · шаг 30 минут</span></div>
      <div class="ptitle__row">
        <h1 class="d d-h1 ptitle__h" data-reveal="clip">Бронь корта</h1>
        <ol class="steps-mini" aria-label="Шаги">
          ${["Дата", "Корт", "Время", "Длительность", "Оплата"].map(
            (s, i) => html`<li key=${s} class=${cx(i + 1 < stepNow && "is-done", i + 1 === stepNow && "is-now")}><span class="num">${String(i + 1).padStart(2, "0")}</span>${s}</li>`
          )}
        </ol>
      </div>
    </section>

    <section class="bk wrap">
      <div class="bk__main">
        <div class="step">
          <${StepHead} no="01" title="Дата" value=${dayLabel(date)} done />
          <${DateStrip} value=${date} onChange=${setDate} bookings=${state.bookings} courtId=${courtId} />
        </div>

        <div class="step">
          <${StepHead} no="02" title="Корт" value=${court && court.name} done=${!!court} active=${!court} />
          <${CourtPicker} value=${courtId} onChange=${setCourtId} bookings=${state.bookings} date=${date} />
        </div>

        <div class=${cx("step", !court && "is-locked")}>
          <${StepHead} no="03" title="Время" value=${start != null && `с ${fromMin(start)}`} done=${start != null} active=${court && start == null} />
          ${court
            ? html`<${SlotGrid} slots=${slots} start=${start} duration=${duration} onPick=${pickStart} />
                <div class="slots__legend t-xs muted">
                  <span><i class="sl sl--free"></i>Свободно</span><span><i class="sl sl--busy"></i>Занято</span><span><i class="sl sl--sel"></i>Ваш выбор</span>
                </div>`
            : html`<div class="step__lock t-sm muted"><${Icon} name="lock" size=${16} /> Сначала выберите корт</div>`}
        </div>

        <div class=${cx("step", start == null && "is-locked")}>
          <${StepHead} no="04" title="Продолжительность" value=${start != null && fmtDuration(duration)} done=${valid} active=${start != null} />
          ${court
            ? html`<${DurationPicker} value=${duration} onChange=${setDuration} slots=${slots} start=${start} price=${court.price} />`
            : html`<div class="step__lock t-sm muted"><${Icon} name="lock" size=${16} /> Выберите корт и время</div>`}
          ${conflict ? html`<p class="bk__err t-sm" role="alert"><${Icon} name="close" size=${16} /> Интервал пересекается с другой бронью — выберите меньшую длительность или другое время.</p>` : null}
        </div>
      </div>

      <aside class="bk__side">
        <div class="sumt">
          <div class="sumt__head">
            <span class="label">Ваша бронь</span>
            <span class="label muted">05 · Оплата</span>
          </div>
          <div class="sumt__court">
            <span class="num sumt__no">${court ? court.no : "—"}</span>
            <span class="d-h4">${court ? court.name : "Корт не выбран"}</span>
          </div>
          <dl class="kv sumt__kv">
            <dt>Дата</dt><dd>${dayLabel(date)}</dd>
            <dt>Время</dt><dd>${start != null ? `${fromMin(start)} — ${endLabel(start, duration)}` : "—"}</dd>
            <dt>Продолжительность</dt><dd>${start != null ? fmtDuration(duration) : "—"}</dd>
            <dt>Цена</dt><dd>${court ? `${rub(court.price)}/ч` : "—"}</dd>
          </dl>
          <div class="sumt__total"><span class="label muted">Итого</span><span class="num sumt__sum">${valid ? rub(price) : "—"}</span></div>
          <${Button} block size="lg" disabled=${!valid} onClick=${goPay}>Перейти к оплате<//>
          <p class="t-xs muted sumt__hint">${!court ? "Выберите корт" : start == null ? "Выберите время начала" : conflict ? "Интервал занят" : "Можно оплатить 100% или 50% сейчас"}</p>
        </div>
      </aside>
    </section>

    <div class=${cx("bk-bar is-dark", valid && "is-ready")}>
      <div class="bk-bar__info">
        <span class="t-xs muted">${court ? `Корт ${court.no} · ${dayLabel(date)}${start != null ? " · " + fromMin(start) : ""}` : "Выберите корт и время"}</span>
        <span class="num bk-bar__sum">${valid ? rub(price) : "—"}</span>
      </div>
      <${Button} disabled=${!valid} onClick=${goPay}>К оплате<//>
    </div>
  `;
}
