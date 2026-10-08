import { html, cx } from "../lib/html.js";
import { club } from "../data/club.js";
import { nowMin, toMin } from "../lib/date.js";
import { useNow } from "../hooks/index.js";
import { StatusDot } from "../components/ui.js";
import { Icon } from "../components/Icon.js";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/** Stylised site plan — not a real map, just the club's position on a grid. */
function SchemeMap() {
  return html`<div class="smap" aria-label="Схема проезда">
    <svg viewBox="0 0 600 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="blk" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(244,241,232,0.06)" />
        </pattern>
      </defs>
      <rect width="600" height="440" fill="url(#blk)" />
      <path class="smap__road smap__road--main" d="M-10 300 C 120 280, 220 250, 330 250 S 520 230, 620 190" />
      <path class="smap__road" d="M140 -10 L 190 460" />
      <path class="smap__road" d="M420 -10 C 410 120, 430 260, 470 460" />
      <path class="smap__road" d="M-10 120 L 620 90" />
      <path class="smap__road smap__road--thin" d="M250 90 L 300 250" />
      <path class="smap__road smap__road--thin" d="M330 250 L 360 460" />
      <rect class="smap__lot" x="300" y="150" width="96" height="70" />
      <g class="smap__courts">
        <rect x="306" y="156" width="20" height="40" /><rect x="330" y="156" width="20" height="40" />
        <rect x="354" y="156" width="20" height="40" /><rect x="378" y="156" width="12" height="40" />
      </g>
      <text x="290" y="296" class="smap__street">ул. Чемордачка</text>
      <text x="306" y="214" class="smap__p">P</text>
    </svg>
    <div class="smap__pin"><span class="num">61</span></div>
    <div class="smap__coord label label-sm">N 47°17′ · E 39°44′ · схема</div>
  </div>`;
}

export function ContactsPage() {
  const now = useNow(30000);
  const open = nowMin() >= toMin(club.hours.open) && nowMin() < toMin(club.hours.close);
  const today = (now.getDay() + 6) % 7;

  return html`
    <section class="ct is-dark">
      <div class="wrap ct__in">
        <div class="ct__left">
          <div class="label ct__k">Contacts · ${club.city}</div>
          <h1 class="ct__addr">
            <span class="d-mega" data-reveal="clip">${"Чемор­дачка"}</span>
            <span class="d-mega ct__num" data-reveal="clip" style="--rd:120ms">105</span>
          </h1>
          <div class="ct__open">
            <${StatusDot} kind=${open ? "live" : "closed"} />
            <span class="label">${open ? "Открыто сейчас" : "Сейчас закрыто"}</span>
            <span class="t-sm muted">· ${club.hours.label}</span>
          </div>
          <div class="ct__ctas">
            <a class="btn btn--primary btn--lg" href=${club.phoneHref}><span class="btn__label">${club.phone}</span><span class="btn__icon"><${Icon} name="phone" size=${18} /></span></a>
            <a class="btn btn--ghost btn--lg" href=${club.mapUrl} target="_blank" rel="noopener"><span class="btn__label">Яндекс Карты</span><span class="btn__icon"><${Icon} name="arrowUpRight" size=${18} /></span></a>
          </div>
        </div>
        <${SchemeMap} />
      </div>
    </section>

    <section class="section wrap ctinfo">
      <div class="ctinfo__rows">
        ${[
          ["phone", "Телефон", html`<a href=${club.phoneHref}>${club.phone}</a>`],
          ["mail", "Email", html`<a href=${"mailto:" + club.email}>${club.email}</a>`],
          ["pin", "Адрес", club.addressFull],
          ["clock", "Режим работы", club.hours.label],
          ["car", "Парковка", "Бесплатная, у входа в клуб"],
          ["telegram", "Telegram", html`<a href=${club.socials[0].url} target="_blank" rel="noopener">@${club.socials[0].handle}</a>`],
          ["instagram", "Instagram", html`<a href=${club.socials[1].url} target="_blank" rel="noopener">@${club.socials[1].handle}</a>`],
          ["user", club.manager.role, club.manager.name],
        ].map(
          ([icon, k, v], i) => html`<div key=${k} class="ctrow" data-reveal style=${{ "--rd": i * 40 + "ms" }}>
            <span class="ctrow__i"><${Icon} name=${icon} size=${20} /></span>
            <span class="label muted">${k}</span>
            <span class="ctrow__v d-h4">${v}</span>
          </div>`
        )}
      </div>

      <aside class="hours">
        <div class="label muted">График</div>
        <ol class="hours__list">
          ${DAYS.map(
            (d, i) => html`<li key=${d} class=${cx("hours__row", i === today && "is-today")}>
              <span class="hours__d">${d}</span>
              <span class="hours__bar"><span></span></span>
              <span class="num hours__t">07:00 — 22:00</span>
            </li>`
          )}
        </ol>
        <p class="t-sm muted">Для бронирования, проведения турниров и мероприятий свяжитесь с управляющим.</p>
      </aside>
    </section>
  `;
}
