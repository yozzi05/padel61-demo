// A booking in the cabinet — court rental or training.
import { html, cx, useState } from "../../lib/html.js";
import { courtById } from "../../data/courts.js";
import { coachById, coachName } from "../../data/coaches.js";
import { fromIso, weekdayShort, monthShort, relDay, toMin, fromMin, fmtDuration } from "../../lib/date.js";
import { rub } from "../../lib/format.js";
import { useStore, useToast } from "../../app/store.js";
import { Modal, Button } from "../../components/ui.js";
import { Icon } from "../../components/Icon.js";

export function BookingItem({ b }) {
  const { cancelBooking } = useStore();
  const toast = useToast();
  const [ask, setAsk] = useState(false);
  const court = courtById(b.courtId);
  const coach = b.coachId && coachById(b.coachId);
  const d = fromIso(b.date);
  const end = fromMin(toMin(b.start) + b.duration);
  const status = b.status === "cancelled" ? "Отменено" : b.status === "done" ? "Сыграно" : b.paid < b.price ? `Оплачено 50% · ${rub(b.price - b.paid)} в клубе` : "Оплачено";

  return html`<article class=${cx("bkit", "bkit--" + b.status, b.kind === "training" && "bkit--training")}>
    <div class="bkit__date">
      <span class="label label-sm">${weekdayShort(d)}</span>
      <span class="num bkit__d">${d.getDate()}</span>
      <span class="label label-sm">${monthShort(d)}</span>
    </div>
    <div class="bkit__main">
      <div class="bkit__top">
        <span class="tag">${b.kind === "training" ? "Тренировка" : "Корт"}</span>
        <span class="t-xs muted">${relDay(b.date)} · P61-${b.id.slice(-4).toUpperCase()}</span>
      </div>
      <div class="bkit__t">
        <span class="num bkit__time">${b.start}–${end}</span>
        <span class="d-h4">${coach ? coachName(coach) : court.name}</span>
      </div>
      <div class="t-sm muted">
        Корт ${court.no} · ${court.short} · ${fmtDuration(b.duration)}${b.kind === "training" ? ` · ${b.trainingType === "group" ? `группа ${b.groupSize}` : "индивидуально"}` : ""}
      </div>
    </div>
    <div class="bkit__side">
      <span class="num bkit__price">${rub(b.price)}</span>
      <span class=${cx("bkit__status t-xs", b.paid < b.price && b.status === "upcoming" && "is-half")}>${status}</span>
      ${b.status === "upcoming"
        ? html`<button class="bkit__cancel t-xs" onClick=${() => setAsk(true)}>Отменить</button>`
        : null}
    </div>
    <${Modal} open=${ask} onClose=${() => setAsk(false)} title="Отменить бронь?">
      <p class="t-sm">${relDay(b.date)}, ${b.start}–${end} · Корт ${court.no}. Отмена без штрафа — за 24 часа до начала. Деньги вернутся на карту (демо).</p>
      <div class="modal__actions">
        <${Button} variant="ghost" icon=${null} onClick=${() => setAsk(false)}>Оставить<//>
        <${Button} variant="dark" icon="close" onClick=${() => { cancelBooking(b.id); setAsk(false); toast("Бронь отменена", "error"); }}>Отменить бронь<//>
      </div>
    <//>
  </article>`;
}
