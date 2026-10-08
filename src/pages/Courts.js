import { html, cx } from "../lib/html.js";
import { href } from "../lib/router.js";
import { useStore } from "../app/store.js";
import { courts } from "../data/courts.js";
import { services } from "../data/club.js";
import { daySlots, liveStatus, boardClock } from "../lib/schedule.js";
import { rub } from "../lib/format.js";
import { Button, StatusDot } from "../components/ui.js";
import { CourtLines } from "../components/graphics.js";
import { Icon } from "../components/Icon.js";

function CourtSection({ c, i }) {
  const { state } = useStore();
  const clock = boardClock();
  const slots = daySlots(state.bookings, c.id, clock.date);
  const free = slots.filter((s) => s.state === "free").length;
  const st = liveStatus(state.bookings, c);
  const variant = ["a", "b", "c", "d"][i];
  return html`<article class=${"csec csec--" + variant} id=${c.id}>
    <div class="csec__img frame frame--hover" data-reveal="wipe">
      <img src=${c.img} alt=${c.name} loading=${i ? "lazy" : "eager"} style=${{ objectPosition: c.imgPos }} />
      <span class="csec__live label"><${StatusDot} kind=${st.kind === "live" ? "live" : st.kind === "free" ? "free" : "closed"} /> ${st.label} · ${st.sub}</span>
    </div>
    <div class="csec__no num" aria-hidden="true">${c.no}</div>
    <div class="csec__body">
      <div class="label muted" data-reveal>Court ${c.no} · ${c.en}</div>
      <h2 class="d-h2 csec__name" data-reveal="clip">${c.name}</h2>
      <p class="lead" data-reveal>${c.lead}</p>
      <dl class="csec__specs" data-reveal>
        <div><dt class="label muted">Формат</dt><dd class="d-h4">${c.format}</dd></div>
        <div><dt class="label muted">Корт</dt><dd class="d-h4">${c.size}</dd></div>
        <div><dt class="label muted">Часы</dt><dd class="d-h4">${c.hours}</dd></div>
        <div><dt class="label muted">Цена</dt><dd class="d-h4">${rub(c.price)}<small>/ч</small></dd></div>
      </dl>
      <ul class="csec__traits" data-reveal>
        ${c.traits.map((t) => html`<li key=${t}><${Icon} name="check" size=${16} />${t}</li>`)}
      </ul>
      <div class="csec__cta" data-reveal>
        <${Button} to=${`/booking?court=${c.id}`} size="lg">Забронировать<//>
        <span class="t-sm muted"><b class="csec__free">${free}</b> свободных окон по 30 мин ${clock.simulated ? "завтра" : "сегодня"}</span>
      </div>
    </div>
    <div class="csec__plan" aria-hidden="true"><${CourtLines} vertical=${c.id !== "single"} animate=${false} /></div>
  </article>`;
}

export function CourtsPage() {
  return html`
    <section class="ptitle wrap">
      <div class="ptitle__meta"><span class="label">Courts</span><span class="label muted">4 типа · 07:00 — 22:00</span></div>
      <div class="ptitle__row">
        <h1 class="d-h1 ptitle__h" data-reveal="clip">Корты</h1>
        <p class="lead" data-reveal>Открытый, шатер, закрытый и single. Под погоду, формат и настроение.</p>
      </div>
    </section>

    <nav class="cnav wrap" aria-label="Типы кортов">
      ${courts.map((c) => html`<a key=${c.id} href=${"#/courts"} onClick=${(e) => { e.preventDefault(); document.getElementById(c.id).scrollIntoView({ behavior: "smooth", block: "start" }); }} class="cnav__item">
        <span class="num">${c.no}</span><span>${c.short}</span><span class="cnav__p">${rub(c.price)}</span>
      </a>`)}
    </nav>

    <div class="wrap csecs">${courts.map((c, i) => html`<${CourtSection} key=${c.id} c=${c} i=${i} />`)}</div>

    <section class="section is-dark price">
      <div class="wrap">
        <div class="price__head">
          <span class="label">Прайс-лист</span>
          <h2 class="d-h2">Аренда и сервис</h2>
        </div>
        <div class="price__table" role="table">
          ${courts.map(
            (c) => html`<a key=${c.id} class="price__row" role="row" href=${href(`/booking?court=${c.id}`)}>
              <span class="num price__no" role="cell">${c.no}</span>
              <span class="d-h3" role="cell">${c.name}</span>
              <span class="t-sm muted" role="cell">с 7:00 по 22:00</span>
              <span class="num price__val" role="cell">${rub(c.price)}<small>/ч</small></span>
              <${Icon} name="arrowUpRight" size=${22} />
            </a>`
          )}
          ${services.map(
            (s) => html`<div key=${s.id} class="price__row price__row--svc" role="row">
              <span class="price__no" role="cell"></span>
              <span class="d-h4" role="cell">${s.label}</span>
              <span class="t-sm muted" role="cell">${s.unit ? "за " + s.unit : ""}</span>
              <span class="num price__val price__val--sm" role="cell">${s.value}</span>
              <span></span>
            </div>`
          )}
        </div>
      </div>
    </section>
  `;
}
