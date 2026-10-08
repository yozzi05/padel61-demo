import { html, cx, useState } from "../lib/html.js";
import { href, Link } from "../lib/router.js";
import { useStore } from "../app/store.js";
import { useNow, useParallax } from "../hooks/index.js";
import { club, services, clubLife, certificate } from "../data/club.js";
import { courts } from "../data/courts.js";
import { coaches, coachName, categoryShort } from "../data/coaches.js";
import { players } from "../data/players.js";
import { openGames } from "../data/openGames.js";
import { tournaments } from "../data/tournaments.js";
import { nextFreeSlots } from "../lib/schedule.js";
import { fromMin, relDay, fromIso, fmtDay, weekdayShort, pad, iso, today } from "../lib/date.js";
import { rub, plural } from "../lib/format.js";
import { Button, LevelBadge, Avatar, SectionHead, CountUp, Form } from "../components/ui.js";
import { Icon } from "../components/Icon.js";
import { CourtLines, Marquee } from "../components/graphics.js";
import { LiveBoard } from "../features/courts/LiveBoard.js";
import { GameTicket } from "../features/matches/GameTicket.js";

/* ── Hero ───────────────────────────────────────── */
function UpNext() {
  const { state } = useStore();
  const slots = nextFreeSlots(state.bookings, 4);
  return html`<div class="upnext" data-reveal style="--rd:500ms">
    <div class="upnext__head">
      <span class="label">Up next</span>
      <span class="label muted">Свободные окна · 60 мин</span>
    </div>
    ${slots.length
      ? slots.map(
          ({ court, slot, date }) => html`<a key=${court.id} class="upnext__row" href=${href(`/booking?court=${court.id}&date=${date}&time=${slot.label}`)}>
            <span class="num upnext__time">${slot.label}</span>
            <span class="upnext__court"><b>Корт ${court.no}</b><span class="muted"> · ${court.short}</span></span>
            <span class="upnext__day label label-sm muted">${relDay(date)}</span>
            <span class="upnext__price">${rub(court.price)}</span>
            <${Icon} name="arrowUpRight" size=${16} />
          </a>`
        )
      : html`<div class="upnext__empty t-sm muted">Сегодня всё занято — посмотрите завтра.</div>`}
  </div>`;
}

function Hero() {
  const photo = useParallax(0.12);
  return html`<section class="hero is-dark">
    <div class="hero__grid" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => html`<span key=${i}></span>`)}</div>
    <div class="hero__photo" data-reveal="wipe">
      <img ref=${photo} src="assets/photos/hero-action.jpg" alt="Игрок в падел тянется за мячом у сетки" fetchpriority="high" />
      <${CourtLines} vertical class="hero__court" />
      <span class="hero__coord label label-sm">N 47°17′ · E 39°44′</span>
    </div>
    <div class="hero__in wrap">
      <div class="hero__top">
        <div class="hero__meta label" data-reveal>
          <span class="hero__club-no">№ 01</span>
          <span>Первый падел-клуб Ростова-на-Дону</span>
        </div>
        <h1 class="hero__title">
          <span class="d-mega hero__line" data-reveal="clip">Padel</span>
          <span class="hero__line hero__line--2">
            <span class="d-mega hero__61" data-reveal="clip" style="--rd:120ms">61</span>
            <span class="hero__stack d" data-reveal style="--rd:300ms">Игра<br />начинается<br />здесь</span>
          </span>
        </h1>
      </div>
      <div class="hero__bottom">
        <div class="hero__copy" data-reveal style="--rd:350ms">
          <p class="lead">Выбирай корт. Собирай команду. Играй. Бронь онлайн, рейтинг игроков, турниры и тренеры — в одном клубе.</p>
          <div class="hero__ctas">
            <${Button} to="/booking" size="lg">Забронировать корт<//>
            <${Button} to="/find-game" size="lg" variant="ghost" icon="ball">Найти игру<//>
          </div>
        </div>
        <${UpNext} />
      </div>
    </div>
    <${Marquee}
      dark
      class="hero__marquee"
      items=${["Ежедневно 07:00 — 22:00", "Открытый · Шатер · Закрытый · Single", "Чемордачка, 105", "7 тренеров · PRO и 2 категория", "Турниры MIXED и PRO AM", "Бесплатная парковка"]}
    />
  </section>`;
}

/* ── Play index (editorial list) ─────────────────── */
const PLAY = [
  { to: "/booking", t: "Забронировать корт", d: "14 дней вперёд. Шаг 30 минут. Оплата онлайн.", img: "assets/photos/club-court.jpg", k: "Court" },
  { to: "/find-game", t: "Найти игру", d: "Заявки игроков твоего уровня. Жми — и ты в составе.", img: "assets/photos/handshake.jpg", k: "Match" },
  { to: "/training", t: "Тренировка", d: "Индивидуально или в группе 2–4 человека.", img: "assets/photos/player-serve.jpg", k: "Coach" },
  { to: "/tournaments", t: "Турниры", d: "MIXED и PRO AM. Группы, сетка, результаты.", img: "assets/photos/players-detail.jpg", k: "Cup" },
  { to: "/players", t: "Рейтинг", d: "Рейтинг силы, XP, серии и достижения.", img: "assets/photos/player-volley.jpg", k: "Rank" },
];

function PlayIndex() {
  const [hover, setHover] = useState(0);
  return html`<section class="section play-idx">
    <div class="wrap play-idx__in">
      <div class="play-idx__left">
        <${SectionHead} index="02" label="Играть" title=${html`Что<br />сегодня?`} />
        <div class="play-idx__preview frame" aria-hidden="true">
          ${PLAY.map((p, i) => html`<img key=${p.to} src=${p.img} alt="" class=${cx(i === hover && "is-on")} loading="lazy" />`)}
          <span class="play-idx__k label">${PLAY[hover].k}</span>
        </div>
      </div>
      <ol class="play-idx__list">
        ${PLAY.map(
          (p, i) => html`<li key=${p.to} data-reveal style=${{ "--rd": i * 70 + "ms" }}>
            <a class="pi" href=${href(p.to)} onMouseEnter=${() => setHover(i)} onFocus=${() => setHover(i)}>
              <span class="pi__no num">${pad(i + 1)}</span>
              <span class="pi__t d-h3">${p.t}</span>
              <span class="pi__d t-sm muted">${p.d}</span>
              <span class="pi__arrow"><${Icon} name="arrowUpRight" size=${28} /></span>
            </a>
          </li>`
        )}
      </ol>
    </div>
  </section>`;
}

/* ── Open games ─────────────────────────────────── */
function OpenGames() {
  const games = openGames.slice(0, 3);
  return html`<section class="section section--tight og">
    <div class="wrap">
      <${SectionHead}
        index="03"
        label="Найти игру"
        title="Ищут игроков"
        aside=${html`<p class="t-sm muted">Заявки обновляются в реальном времени. Выбери свой уровень — и в состав.</p><a class="alink" href=${href("/find-game")}>Все заявки <${Icon} name="arrowUpRight" size=${16} /></a>`}
      />
      <div class="og__list">${games.map((g, i) => html`<div key=${g.id} data-reveal style=${{ "--rd": i * 90 + "ms" }}><${GameTicket} game=${g} compact /></div>`)}</div>
    </div>
  </section>`;
}

/* ── Leaderboard teaser ─────────────────────────── */
function RankTeaser() {
  const top = players.slice(0, 5);
  const leader = top[0];
  return html`<section class="section rt is-dark">
    <${CourtLines} class="rt__court" animate=${false} />
    <div class="wrap rt__in">
      <div class="rt__left">
        <${SectionHead} dark index="04" label="Rank · Padel 61" title=${html`Рейтинг<br />клуба`} />
        <div class="rt__leader" data-reveal>
          <span class="label muted">№1 · ${leader.name}</span>
          <span class="num rt__leader-n"><${CountUp} value=${leader.rating} /></span>
          <span class="t-sm muted">Рейтинг — сила игры. Растёт с победами над сильными соперниками.</span>
        </div>
        <${Button} to="/players" variant="primary">Весь рейтинг<//>
      </div>
      <ol class="rt__list">
        ${top.map(
          (p, i) => html`<li key=${p.id} data-reveal style=${{ "--rd": i * 70 + "ms" }}>
            <a class="rt__row" href=${href("/players/" + p.id)}>
              <span class="num rt__rank">${pad(p.rank)}</span>
              <${Avatar} name=${p.name} size=${44} />
              <span class="rt__name">${p.name}<span class="t-xs muted">${p.matches} матчей · ${p.winRate}% WR</span></span>
              <${LevelBadge} level=${p.level} />
              <${Form} form=${p.form} />
              <span class="num rt__rating">${p.rating}</span>
            </a>
          </li>`
        )}
      </ol>
    </div>
  </section>`;
}

/* ── Coaches strip ──────────────────────────────── */
function CoachStrip() {
  return html`<section class="section cs">
    <div class="wrap">
      <${SectionHead}
        index="05"
        label="Тренеры"
        title=${html`Тренируйся<br />с лучшими`}
        aside=${html`<p class="t-sm muted">3 тренера PRO категории и 4 тренера 2 категории. Уровни от D до A.</p><a class="alink" href=${href("/coaches")}>Все тренеры <${Icon} name="arrowUpRight" size=${16} /></a>`}
      />
    </div>
    <div class="cs__rail">
      ${coaches.map(
        (c, i) => html`<a key=${c.id} class="cs__card" href=${href("/coaches/" + c.id)} data-reveal style=${{ "--rd": i * 60 + "ms" }}>
          <span class="cs__img frame"><img src=${c.img} alt=${coachName(c)} loading="lazy" /></span>
          <span class="cs__name vlabel">${coachName(c)}</span>
          <span class="cs__meta">
            <span class=${cx("tag", c.category === "PRO" ? "tag--lime" : "tag--ink")}>${categoryShort(c.category)}</span>
            <span class="t-xs">${c.languages.join(" / ")}</span>
            <span class="num cs__price">${rub(c.price)}</span>
          </span>
        </a>`
      )}
    </div>
  </section>`;
}

/* ── Tournament feature ─────────────────────────── */
function Countdown({ dateIso, time }) {
  const now = useNow(1000);
  const [h, m] = time.split(":").map(Number);
  const target = fromIso(dateIso);
  target.setHours(h, m, 0, 0);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 864e5);
  const hh = Math.floor((diff % 864e5) / 36e5);
  const mm = Math.floor((diff % 36e5) / 6e4);
  const ss = Math.floor((diff % 6e4) / 1e3);
  const cell = (v, l) => html`<span class="cd__cell"><span class="num cd__v">${pad(v)}</span><span class="label label-sm">${l}</span></span>`;
  return html`<div class="cd" aria-label="До старта">${cell(d, "дн")}${cell(hh, "ч")}${cell(mm, "мин")}${cell(ss, "сек")}</div>`;
}

function TournamentFeature() {
  const { state } = useStore();
  const t = tournaments[0];
  const taken = t.teams.length + (state.registrations[t.id] ? 1 : 0);
  const left = t.capacity - taken;
  const d = fromIso(t.date);
  return html`<section class="tf is-dark">
    <div class="tf__img"><img src=${t.img} alt="" loading="lazy" /></div>
    <div class="wrap tf__in">
      <div class="tf__top">
        <span class="label"><span class="shead__index" style="background:var(--c-lime);color:var(--c-ink)">06</span> Турнир · Up next</span>
        <${Countdown} dateIso=${t.date} time=${t.time} />
      </div>
      <h2 class="d-mega tf__title" data-reveal="clip">${t.title}</h2>
      <div class="tf__bar">
        <div class="tf__cell"><span class="label muted">Дата</span><span class="d-h4">${fmtDay(d)}, ${weekdayShort(d)}</span></div>
        <div class="tf__cell"><span class="label muted">Формат</span><span class="d-h4">${t.format} ${t.level}</span></div>
        <div class="tf__cell"><span class="label muted">Команды</span><span class="d-h4">${t.capacity}</span></div>
        <div class="tf__cell"><span class="label muted">Осталось</span><span class="d-h4 tf__left">${left} ${plural(left, ["место", "места", "мест"])}</span></div>
        <div class="tf__cell tf__cell--cta"><${Button} to=${"/tournaments/" + t.id} size="lg">${state.registrations[t.id] ? "Вы участвуете" : "Участвовать"}<//></div>
      </div>
    </div>
  </section>`;
}

/* ── Club life (real club sections) ─────────────── */
function ClubLife() {
  return html`<section class="section cl">
    <div class="wrap">
      <${SectionHead}
        index="07"
        label="Клуб"
        title=${html`Жизнь<br />вне корта`}
        aside=${html`<p class="t-sm muted">${club.intro}</p>`}
      />
      <div class="cl__grid">
        ${clubLife.map(
          (c, i) => html`<figure key=${c.id} class=${"cl__item cl__item--" + (i + 1)} data-reveal style=${{ "--rd": i * 80 + "ms" }}>
            <div class="frame frame--hover cl__img"><img src=${c.img} alt=${c.title} loading="lazy" /></div>
            <figcaption>
              <span class="num cl__no">${pad(i + 1)}</span>
              <span><b>${c.title}</b><span class="t-sm muted"> — ${c.sub}</span></span>
            </figcaption>
          </figure>`
        )}
      </div>
      <div class="svc" data-reveal>
        ${services.map(
          (s) => html`<div key=${s.id} class="svc__item">
            <span class="label muted">${s.label}</span>
            <span class="d-h3">${s.value}</span>
            ${s.unit ? html`<span class="t-xs muted">за ${s.unit}</span>` : html`<span class="t-xs muted"> </span>`}
          </div>`
        )}
      </div>
      <div class="cert" data-reveal>
        <div class="cert__img frame"><img src=${certificate.img} alt="Подарочный сертификат Падел 61" loading="lazy" /></div>
        <div class="cert__body">
          <span class="label"><${Icon} name="gift" size=${16} /> Подарок</span>
          <h3 class="d-h3">${certificate.title}</h3>
          <p class="t-sm">${certificate.lead}</p>
          <ul class="cert__list t-sm">${certificate.points.map((p) => html`<li key=${p}>${p}</li>`)}</ul>
          <div class="cert__row">
            <span class="num num-l">${certificate.price}</span>
            <a class="btn btn--dark" href=${club.socials[0].url} target="_blank" rel="noopener"><span class="btn__label">Написать в Telegram</span><span class="btn__icon"><${Icon} name="telegram" size=${18} /></span></a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

/* ── Live courts section ─────────────────────────── */
function LiveCourts() {
  return html`<section class="section lc">
    <div class="wrap">
      <${SectionHead}
        index="01"
        label=${`Live · ${courts.length} корта`}
        title="Корты сейчас"
        aside=${html`<p class="t-sm muted">Статус обновляется каждую секунду. Свободно — бронируйте в один клик.</p><a class="alink" href=${href("/courts")}>О кортах <${Icon} name="arrowUpRight" size=${16} /></a>`}
      />
      <${LiveBoard} />
    </div>
  </section>`;
}

export function HomePage() {
  return html`
    <${Hero} />
    <${LiveCourts} />
    <${PlayIndex} />
    <${OpenGames} />
    <${RankTeaser} />
    <${CoachStrip} />
    <${TournamentFeature} />
    <${ClubLife} />
  `;
}
