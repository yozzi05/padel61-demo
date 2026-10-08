import { html, cx } from "../lib/html.js";
import { href } from "../lib/router.js";
import { useStore } from "../app/store.js";
import { tournaments, STATUS_LABEL } from "../data/tournaments.js";
import { fromIso, monthShort, weekdayShort, fmtDay } from "../lib/date.js";
import { rub, plural } from "../lib/format.js";
import { Button } from "../components/ui.js";
import { Icon } from "../components/Icon.js";
import { teamsOf, teamById, teamLabel } from "../features/tournaments/index.js";

function Seats({ taken, cap }) {
  return html`<span class="seatbar" aria-label=${`Занято ${taken} из ${cap}`}>
    ${Array.from({ length: cap }, (_, i) => html`<i key=${i} class=${i < taken ? "on" : ""}></i>`)}
  </span>`;
}

function champion(t) {
  if (t.status !== "finished") return null;
  const f = t.bracket[t.bracket.length - 1].matches[0];
  return teamById(t.teams, f.winner === "a" ? f.a : f.b);
}

export function TournamentsPage() {
  const { state } = useStore();
  const [feat, ...rest] = tournaments;
  const reg = state.registrations[feat.id];
  const featTaken = teamsOf(feat, reg).length;
  const fd = fromIso(feat.date);

  return html`
    <section class="ptitle wrap">
      <div class="ptitle__meta"><span class="label">Tournaments</span><span class="label muted">MIXED · PRO AM</span></div>
      <div class="ptitle__row">
        <h1 class="d-h1 ptitle__h" data-reveal="clip">Турниры</h1>
        <p class="lead" data-reveal>Группы, сетка, live-счёт и результаты. Количество мест ограничено.</p>
      </div>
    </section>

    <section class="wrap tl-feat">
      <a class="tfeat is-dark" href=${href("/tournaments/" + feat.id)} data-reveal>
        <div class="tfeat__img"><img src=${feat.img} alt="" /></div>
        <div class="tfeat__date">
          <span class="num tfeat__d">${fd.getDate()}</span>
          <span class="label">${monthShort(fd)} · ${weekdayShort(fd)}</span>
        </div>
        <div class="tfeat__body">
          <span class="tag tag--lime">${STATUS_LABEL[feat.status]}</span>
          <h2 class="d-mega tfeat__t">${feat.title}</h2>
          <div class="tfeat__meta">
            <span class="d-h4">${feat.format} ${feat.level}</span>
            <span class="t-sm muted">${feat.capacity} команд · взнос ${rub(feat.fee)}</span>
          </div>
          <div class="tfeat__foot">
            <div class="tfeat__seats"><${Seats} taken=${featTaken} cap=${feat.capacity} /><span class="t-sm"><b class="tfeat__left">Осталось ${feat.capacity - featTaken} ${plural(feat.capacity - featTaken, ["место", "места", "мест"])}</b></span></div>
            <span class="btn btn--primary btn--lg"><span class="btn__label">${reg ? "Вы участвуете" : "Участвовать"}</span><span class="btn__icon"><${Icon} name="arrow" size=${18} /></span></span>
          </div>
        </div>
      </a>
    </section>

    <section class="wrap tl-list">
      ${rest.map((t, i) => {
        const d = fromIso(t.date);
        const taken = teamsOf(t, state.registrations[t.id]).length;
        const ch = champion(t);
        return html`<a key=${t.id} class=${cx("trow-t", "is-" + t.status)} href=${href("/tournaments/" + t.id)} data-reveal style=${{ "--rd": i * 80 + "ms" }}>
          <span class="trow-t__date"><span class="num">${d.getDate()}</span><span class="label label-sm">${monthShort(d)}</span></span>
          <span class="trow-t__img frame"><img src=${t.img} alt="" loading="lazy" /></span>
          <span class="trow-t__main">
            <span class="trow-t__status">${t.status === "live" ? html`<span class="live-tag">LIVE</span>` : html`<span class=${cx("tag", t.status === "open" ? "tag--lime" : "")}>${STATUS_LABEL[t.status]}</span>`}</span>
            <span class="d-h2 trow-t__t">${t.title}</span>
            <span class="t-sm muted">${t.format} · ${t.level} · ${t.scheme}</span>
          </span>
          <span class="trow-t__side">
            ${ch
              ? html`<span class="label muted">Чемпионы</span><span class="d-h4 trow-t__champ"><${Icon} name="trophy" size=${18} /> ${teamLabel(ch)}</span>`
              : t.status === "live"
                ? html`<span class="label muted">Сейчас</span><span class="d-h4">Полуфиналы</span>`
                : html`<span class="label muted">${taken} / ${t.capacity} команд</span><${Seats} taken=${taken} cap=${t.capacity} /><span class="t-sm"><b>Осталось ${t.capacity - taken}</b> · ${rub(t.fee)}</span>`}
          </span>
          <span class="trow-t__arrow"><${Icon} name="arrowUpRight" size=${28} /></span>
        </a>`;
      })}
    </section>
  `;
}
