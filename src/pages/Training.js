import { html, cx, useMemo, useState, useEffect } from "../lib/html.js";
import { useStore } from "../app/store.js";
import { coaches, coachById, coachName, categoryShort } from "../data/coaches.js";
import { courts, courtById } from "../data/courts.js";
import { daySlots, rangeIsFree } from "../lib/schedule.js";
import { iso, today, addDays, toMin, fromMin, nowMin } from "../lib/date.js";
import { rub } from "../lib/format.js";
import { Button, Empty } from "../components/ui.js";
import { Icon } from "../components/Icon.js";
import { CourtLines } from "../components/graphics.js";
import { DateStrip, StepHead, dayLabel } from "../features/booking/pickers.js";
import { Checkout } from "../features/booking/Checkout.js";
import { coachFreeHours } from "../features/coaches/availability.js";

const TYPES = [
  { id: "individual", label: "Индивидуальная", sub: "1 на 1 с тренером" },
  { id: "group", label: "Групповая", sub: "2–4 игрока" },
];

const priceFor = (c, type, size) => (type === "individual" ? c.price : c.group[size] || null);

export function TrainingPage({ query }) {
  const { state, addBooking } = useStore();
  const [type, setType] = useState(query.type === "group" ? "group" : "individual");
  const [size, setSize] = useState(2);
  const [coachId, setCoachId] = useState(query.coach && coachById(query.coach) ? query.coach : null);
  const [date, setDate] = useState(query.date || (nowMin() > 20 * 60 ? iso(addDays(today(), 1)) : iso(today())));
  const [hour, setHour] = useState(query.time ? parseInt(query.time, 10) : null);
  const [courtId, setCourtId] = useState(null);
  const [frozen, setFrozen] = useState(null);

  const coach = coachId && coachById(coachId);
  const price = coach ? priceFor(coach, type, size) : null;
  const hours = useMemo(() => (coach ? coachFreeHours(coach.id, date, state.bookings) : []), [coachId, date, state.bookings]);

  // Courts free for the chosen hour; single court only fits individual sessions
  const courtOptions = useMemo(() => {
    if (hour == null) return [];
    return courts
      .filter((c) => (type === "group" ? c.id !== "single" : true))
      .map((c) => ({ c, free: rangeIsFree(daySlots(state.bookings, c.id, date), hour * 60, 60) }));
  }, [hour, date, type, state.bookings]);

  useEffect(() => {
    if (frozen) return;
    if (hour != null && !hours.find((h) => h.h === hour && h.state === "free")) setHour(null);
  }, [hours]);
  useEffect(() => {
    if (frozen) return;
    const opt = courtOptions.find((o) => o.c.id === courtId);
    if (!opt || !opt.free) setCourtId((courtOptions.find((o) => o.free) || {}).c?.id || null);
  }, [courtOptions]);

  const ready = coach && price && hour != null && courtId;
  const court = courtId && courtById(courtId);

  const goPay = () => {
    setFrozen({
      kicker: `Тренировка · ${categoryShort(coach.category)}`,
      title: coachName(coach),
      lines: [
        ["Дата", dayLabel(date)],
        ["Время", `${fromMin(hour * 60)} — ${fromMin(hour * 60 + 60)}`],
        ["Формат", type === "individual" ? "Индивидуальная" : `Группа · ${size} игрока`],
        ["Корт", `${court.no} · ${court.short}`],
      ],
      total: price,
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const confirm = ({ plan, method, paid }) => {
    const b = {
      id: "t-" + Date.now().toString(36),
      kind: "training",
      coachId,
      trainingType: type,
      groupSize: type === "group" ? size : 1,
      courtId,
      date,
      start: fromMin(hour * 60),
      duration: 60,
      price,
      paid,
      plan,
      method,
      status: "upcoming",
      createdAt: iso(today()),
    };
    addBooking(b);
    return b;
  };

  if (frozen) {
    return html`<section class="bk-co wrap"><${Checkout} order=${frozen} onBack=${() => setFrozen(null)} onConfirm=${confirm} /></section>`;
  }

  return html`
    <section class="ptitle wrap tr-title">
      <div class="ptitle__meta"><span class="label">Training</span><span class="label muted">Стоимость за 1 час занятия</span></div>
      <div class="ptitle__row">
        <h1 class="d-h1 ptitle__h" data-reveal="clip">Тренировки</h1>
        <div class="tr-types" data-reveal>
          ${TYPES.map(
            (t) => html`<button key=${t.id} class=${cx("tr-type", type === t.id && "is-on")} onClick=${() => setType(t.id)} aria-pressed=${type === t.id}>
              <span class="d-h4">${t.label}</span><span class="t-xs">${t.sub}</span>
            </button>`
          )}
        </div>
      </div>
    </section>

    <section class="bk wrap">
      <div class="bk__main">
        ${type === "group"
          ? html`<div class="step">
              <${StepHead} no="00" title="Размер группы" value=${size + " игрока"} done />
              <div class="seg">${[2, 3, 4].map((n) => html`<button key=${n} class=${cx("seg__btn", size === n && "is-on")} onClick=${() => setSize(n)}><span>${n} игрока</span><small>${coaches.filter((c) => c.group[n]).length} тренеров</small></button>`)}</div>
            </div>`
          : null}

        <div class="step">
          <${StepHead} no="01" title="Тренер" value=${coach && coachName(coach)} done=${!!coach} active=${!coach} />
          <div class="tcoach">
            ${coaches.map((c) => {
              const p = priceFor(c, type, size);
              return html`<button key=${c.id} class=${cx("tcoach__item", coachId === c.id && "is-on")} disabled=${!p} onClick=${() => setCoachId(c.id)} aria-pressed=${coachId === c.id}>
                <span class="frame tcoach__img"><img src=${c.img} alt="" loading="lazy" /></span>
                <span class="tcoach__body">
                  <span class="tcoach__name">${coachName(c)}</span>
                  <span class="t-xs muted">${categoryShort(c.category)} · ${c.languages.join("/")}</span>
                </span>
                <span class="num tcoach__price">${p ? rub(p) : "—"}</span>
              </button>`;
            })}
          </div>
        </div>

        <div class="step">
          <${StepHead} no="02" title="Дата" value=${dayLabel(date)} done />
          <${DateStrip} value=${date} onChange=${setDate} bookings=${state.bookings} />
        </div>

        <div class=${cx("step", !coach && "is-locked")}>
          <${StepHead} no="03" title="Время" value=${hour != null && fromMin(hour * 60)} done=${hour != null} active=${coach && hour == null} />
          ${coach
            ? hours.some((h) => h.state === "free")
              ? html`<div class="slots__grid tr-hours">
                  ${hours.map(
                    (h) => html`<button key=${h.h} class=${cx("slot", "slot--" + h.state, hour === h.h && "is-start")} disabled=${h.state !== "free"} onClick=${() => setHour(h.h)}>
                      <span class="slot__t">${h.label}</span>${h.state === "mine" ? html`<span class="slot__tag">ваша</span>` : null}
                    </button>`
                  )}
                </div>`
              : html`<${Empty} title="Нет свободных часов" text="У тренера всё занято в этот день. Выберите другую дату." icon="calendar" />`
            : html`<div class="step__lock t-sm muted"><${Icon} name="lock" size=${16} /> Сначала выберите тренера</div>`}
        </div>

        <div class=${cx("step", hour == null && "is-locked")}>
          <${StepHead} no="04" title="Корт" value=${court && court.name} done=${!!court} active=${hour != null && !court} />
          ${hour != null
            ? html`<div class="tcourts">
                ${courtOptions.map(
                  ({ c, free }) => html`<button key=${c.id} class=${cx("tcourt", courtId === c.id && "is-on")} disabled=${!free} onClick=${() => setCourtId(c.id)}>
                    <span class="tcourt__plan"><${CourtLines} vertical animate=${false} /></span>
                    <span class="num tcourt__no">${c.no}</span>
                    <span class="t-sm"><b>${c.short}</b><br /><span class="muted">${free ? "свободен" : "занят"}</span></span>
                  </button>`
                )}
              </div>`
            : html`<div class="step__lock t-sm muted"><${Icon} name="lock" size=${16} /> Выберите время</div>`}
        </div>
      </div>

      <aside class="bk__side">
        <div class="sumt">
          <div class="sumt__head"><span class="label">Тренировка</span><span class="label muted">05 · Оплата</span></div>
          <div class="sumt__court">
            ${coach ? html`<span class="frame sumt__ph"><img src=${coach.img} alt="" /></span>` : html`<span class="num sumt__no">—</span>`}
            <span class="d-h4">${coach ? coachName(coach) : "Тренер не выбран"}</span>
          </div>
          <dl class="kv sumt__kv">
            <dt>Формат</dt><dd>${type === "individual" ? "Индивидуальная" : `Группа · ${size}`}</dd>
            <dt>Дата</dt><dd>${dayLabel(date)}</dd>
            <dt>Время</dt><dd>${hour != null ? `${fromMin(hour * 60)} — ${fromMin(hour * 60 + 60)}` : "—"}</dd>
            <dt>Корт</dt><dd>${court ? `${court.no} · ${court.short}` : "—"}</dd>
          </dl>
          <div class="sumt__total"><span class="label muted">За час</span><span class="num sumt__sum">${ready ? rub(price) : "—"}</span></div>
          <${Button} block size="lg" disabled=${!ready} onClick=${goPay}>Перейти к оплате<//>
          <p class="t-xs muted sumt__hint">${!coach ? "Выберите тренера" : hour == null ? "Выберите время" : !court ? "Нет свободного корта на это время" : "+80 XP за тренировку"}</p>
        </div>
      </aside>
    </section>

    <div class=${cx("bk-bar is-dark", ready && "is-ready")}>
      <div class="bk-bar__info">
        <span class="t-xs muted">${coach ? `${coachName(coach)} · ${dayLabel(date)}${hour != null ? " · " + fromMin(hour * 60) : ""}` : "Выберите тренера"}</span>
        <span class="num bk-bar__sum">${ready ? rub(price) : "—"}</span>
      </div>
      <${Button} disabled=${!ready} onClick=${goPay}>К оплате<//>
    </div>
  `;
}
