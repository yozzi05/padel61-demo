import { html, cx } from "../lib/html.js";
import { href } from "../lib/router.js";
import { useStore } from "../app/store.js";
import { coaches, coachById, coachName, categoryShort, categoryLabel } from "../data/coaches.js";
import { LEVELS, LEVEL_INFO } from "../data/club.js";
import { relDay } from "../lib/date.js";
import { rub } from "../lib/format.js";
import { Button, Empty } from "../components/ui.js";
import { Icon } from "../components/Icon.js";
import { CourtLines } from "../components/graphics.js";
import { nextWindows } from "../features/coaches/availability.js";

export function CoachPage({ params }) {
  const { state } = useStore();
  const c = coachById(params.id);
  if (!c) {
    return html`<section class="ptitle wrap"><${Empty} title="Тренер не найден" text="Возможно, ссылка устарела." action=${html`<${Button} to="/coaches">Все тренеры<//>`} /></section>`;
  }
  const windows = nextWindows(c.id, 6, state.bookings);
  const others = coaches.filter((x) => x.id !== c.id).slice(0, 4);
  const groupRows = Object.entries(c.group);

  return html`
    <section class="ath is-dark">
      <${CourtLines} class="ath__court" vertical />
      <div class="wrap ath__in">
        <a class="ath__back t-sm" href=${href("/coaches")}><${Icon} name="arrowLeft" size=${16} /> Все тренеры</a>
        <div class="ath__grid">
          <div class="ath__names">
            <span class="label ath__k">Coach · ${categoryShort(c.category)} · Padel 61</span>
            <h1 class="ath__name">
              <span class="d-mega" data-reveal="clip">${c.first}</span>
              ${c.last ? html`<span class="d-mega ath__last" data-reveal="clip" style="--rd:120ms">${c.last}</span>` : null}
            </h1>
          </div>
          <figure class="ath__photo" data-reveal="wipe">
            <img src=${c.img} alt=${coachName(c)} />
            <figcaption class="ath__cap label">${c.countryCode} / ${c.languages.join(" / ")}</figcaption>
          </figure>
        </div>
        <dl class="ath__stats">
          <div><dt class="label muted">Category</dt><dd class="num">${c.category === "PRO" ? "PRO" : "II"}</dd></div>
          <div><dt class="label muted">Country</dt><dd class="num">${c.countryCode}<small>${c.country}</small></dd></div>
          <div><dt class="label muted">Languages</dt><dd class="num">${c.languages.join(" / ")}</dd></div>
          <div><dt class="label muted">Индивидуально</dt><dd class="num ath__price">${rub(c.price)}<small>/ час</small></dd></div>
        </dl>
      </div>
    </section>

    <section class="section wrap coachp">
      <div class="coachp__main">
        <div class="coachp__block">
          <div class="label muted">Levels</div>
          <div class="levels">
            ${LEVELS.map(
              (l, i) => html`<div key=${l} class=${cx("levels__cell", c.levels.includes(l) && "is-on")} data-reveal style=${{ "--rd": i * 60 + "ms" }}>
                <span class="d-h2">${l}</span>
                <span class="t-xs">${LEVEL_INFO[l]}</span>
              </div>`
            )}
          </div>
          <p class="t-sm muted coachp__levels-note">Работает с игроками уровней (D) начинающие, (C/C+) любители, (B/B+) профессионалы (A).</p>
        </div>

        <div class="coachp__block">
          <div class="label muted">Стоимость · за 1 час</div>
          <table class="ptable">
            <tbody>
              <tr><th>Индивидуальная</th><td>1 игрок</td><td class="num">${rub(c.price)}</td></tr>
              ${groupRows.map(
                ([n, p]) => html`<tr key=${n} class=${cx(!p && "is-na")}><th>Группа</th><td>${n} игрока</td><td class="num">${p ? rub(p) : "—"}</td></tr>`
              )}
            </tbody>
          </table>
          ${groupRows.every(([, p]) => !p) ? html`<p class="t-sm muted">Групповые занятия — по запросу у управляющего клуба.</p>` : null}
        </div>
      </div>

      <aside class="coachp__side">
        <div class="win">
          <div class="win__head">
            <span class="label">Ближайшие окна</span>
            <span class="label muted">${categoryLabel(c.category)}</span>
          </div>
          ${windows.length
            ? html`<ul>
                ${windows.map(
                  (w) => html`<li key=${w.date + w.h}>
                    <a class="win__row" href=${href(`/training?coach=${c.id}&date=${w.date}&time=${w.label}`)}>
                      <span class="t-sm">${relDay(w.date)}</span>
                      <span class="num win__t">${w.label}</span>
                      <${Icon} name="arrow" size=${16} />
                    </a>
                  </li>`
                )}
              </ul>`
            : html`<div class="win__empty"><${Empty} title="Нет окон" text="Расписание на неделю заполнено." /></div>`}
          <div class="win__cta"><${Button} to=${`/training?coach=${c.id}`} block size="lg">Записаться на тренировку<//></div>
        </div>
      </aside>
    </section>

    <section class="section--tight wrap others">
      <div class="label muted others__k">Другие тренеры</div>
      <div class="others__list">
        ${others.map(
          (o) => html`<a key=${o.id} class="others__item" href=${href("/coaches/" + o.id)}>
            <span class="frame others__img"><img src=${o.img} alt="" loading="lazy" /></span>
            <span class="d-h4">${coachName(o)}</span>
            <span class="t-xs muted">${categoryLabel(o.category)} · ${rub(o.price)}</span>
          </a>`
        )}
      </div>
    </section>
  `;
}
