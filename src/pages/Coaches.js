import { html, cx, useState } from "../lib/html.js";
import { href } from "../lib/router.js";
import { coaches, coachName, categoryLabel, hasGroup } from "../data/coaches.js";
import { LEVELS } from "../data/club.js";
import { rub, plural } from "../lib/format.js";
import { Chips } from "../components/ui.js";
import { Icon } from "../components/Icon.js";

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "PRO", label: "PRO категория" },
  { id: "II", label: "2 категория" },
  { id: "group", label: "Есть группы" },
];

export function CoachesPage() {
  const [f, setF] = useState("all");
  const list = coaches.filter((c) => (f === "all" ? true : f === "group" ? hasGroup(c) : c.category === f));
  return html`
    <section class="ptitle wrap">
      <div class="ptitle__meta"><span class="label">Coaches</span><span class="label muted">${coaches.length} тренеров · уровни D — A</span></div>
      <div class="ptitle__row">
        <h1 class="d-h1 ptitle__h" data-reveal="clip">Тренеры</h1>
        <div class="coaches__intro" data-reveal>
          <p class="lead">Индивидуально или в группе 2–4 человека. Стоимость — за час занятия.</p>
          <a class="alink" href=${href("/training")}>Записаться на тренировку <${Icon} name="arrowUpRight" size=${16} /></a>
        </div>
      </div>
    </section>

    <section class="wrap roster">
      <div class="roster__bar">
        <${Chips} items=${FILTERS} value=${f} onChange=${setF} />
        <span class="t-sm muted">${list.length} ${plural(list.length, ["тренер", "тренера", "тренеров"])}</span>
      </div>
      <ol class="roster__list">
        ${list.map(
          (c, i) => html`<li key=${c.id} data-reveal style=${{ "--rd": i * 50 + "ms" }}>
            <a class="crow" href=${href("/coaches/" + c.id)}>
              <span class="crow__no num">${String(i + 1).padStart(2, "0")}</span>
              <span class="crow__img frame"><img src=${c.img} alt=${coachName(c)} loading="lazy" /></span>
              <span class="crow__name">
                <span class="crow__first">${c.first}</span>
                <span class="d-h3 crow__last">${c.last || c.first}</span>
              </span>
              <span class="crow__cat">
                <span class=${cx("tag", c.category === "PRO" ? "tag--lime" : "tag--ink")}>${categoryLabel(c.category)}</span>
              </span>
              <span class="crow__meta t-sm">
                <span><span class="label muted">Страна</span>${c.country}</span>
                <span><span class="label muted">Языки</span>${c.languages.join(" / ")}</span>
              </span>
              <span class="crow__levels" aria-label=${"Уровни: " + c.levels.join(", ")}>
                ${LEVELS.map((l) => html`<span key=${l} class=${cx("crow__lv", c.levels.includes(l) && "is-on")}>${l}</span>`)}
              </span>
              <span class="crow__price"><span class="label muted">Индивид.</span><span class="num">${rub(c.price)}</span></span>
              <span class="crow__arrow"><${Icon} name="arrowUpRight" size=${24} /></span>
            </a>
          </li>`
        )}
      </ol>
    </section>
  `;
}
