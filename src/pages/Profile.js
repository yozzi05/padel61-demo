import { html, cx, useState } from "../lib/html.js";
import { href, navigate } from "../lib/router.js";
import { useStore, useToast } from "../app/store.js";
import { playerById, players, DEMO_USER_ID } from "../data/players.js";
import { tournaments } from "../data/tournaments.js";
import { openGames } from "../data/openGames.js";
import { XP_RULES } from "../data/achievements.js";
import { courtById } from "../data/courts.js";
import { iso, today, toMin, nowMin, relDay, fromIso, fmtDay } from "../lib/date.js";
import { rub, plural } from "../lib/format.js";
import { Tabs, Button, Empty, Chips } from "../components/ui.js";
import { RatingChart } from "../components/graphics.js";
import { Icon } from "../components/Icon.js";
import { AthleteHeader } from "./Player.js";
import { Login } from "../features/profile/Login.js";
import { BookingItem } from "../features/profile/BookingItem.js";
import { MatchRow } from "../features/matches/MatchRow.js";
import { GameTicket } from "../features/matches/GameTicket.js";
import { matchesFor, upcomingFor } from "../features/matches/playerMatches.js";
import { achievementsFor, AchievementBadge } from "../features/gamification/index.js";
import { teamLabel, teamsOf } from "../features/tournaments/index.js";

const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "games", label: "Мои игры" },
  { id: "bookings", label: "Бронирования" },
  { id: "rating", label: "Рейтинг" },
  { id: "tournaments", label: "Турниры" },
  { id: "achievements", label: "Достижения" },
  { id: "settings", label: "Настройки" },
];

/** Past bookings are "done" even if they were created as upcoming. */
function effective(b) {
  if (b.status === "cancelled") return b;
  const t = iso(today());
  const ended = b.date < t || (b.date === t && toMin(b.start) + b.duration <= nowMin());
  return { ...b, status: ended ? "done" : "upcoming" };
}
const byTime = (a, b) => (a.date + a.start < b.date + b.start ? -1 : 1);

function Block({ title, action, children, class: cls }) {
  return html`<div class=${cx("pblock", cls)}>
    <div class="pl-block__head"><span class="label">${title}</span>${action || null}</div>
    ${children}
  </div>`;
}

function NextUp({ booking, match }) {
  if (!booking && !match) {
    return html`<${Empty} title="Ближайших игр нет" text="Забронируйте корт или присоединитесь к игре." icon="calendar" action=${html`<${Button} to="/booking" size="sm">Забронировать<//>`} />`;
  }
  const useMatch = match && (!booking || match.date + match.time < booking.date + booking.start);
  const date = useMatch ? match.date : booking.date;
  const time = useMatch ? match.time : booking.start;
  const court = courtById(useMatch ? match.courtId : booking.courtId);
  return html`<div class="nextup is-dark">
    <div class="nextup__top"><span class="label nextup__k">Up next</span><span class="label muted">${useMatch ? "Рейтинговый матч" : booking.kind === "training" ? "Тренировка" : "Бронь корта"}</span></div>
    <div class="nextup__when"><span class="num nextup__t">${time}</span><span class="d-h3">${relDay(date)}</span></div>
    <div class="nextup__court t-sm"><span class="num">${court.no}</span> ${court.name}</div>
    ${useMatch ? html`<div class="nextup__vs t-sm">${teamLabel({ players: match.teamA })} <span class="muted">vs</span> ${teamLabel({ players: match.teamB })}</div>` : null}
  </div>`;
}

export function ProfilePage({ query }) {
  const store = useStore();
  const { state, logout, resetDemo, updateSettings } = store;
  const toast = useToast();
  const [tab, setTab] = useState(query.tab || "overview");
  const [bkFilter, setBkFilter] = useState("upcoming");

  if (!state.user) return html`<${Login} />`;

  const me = playerById(DEMO_USER_ID);
  const xp = me.xp + state.xpBonus;
  const bookings = state.bookings.map(effective);
  const upcoming = bookings.filter((b) => b.status === "upcoming").sort(byTime);
  const past = bookings.filter((b) => b.status === "done").sort(byTime).reverse();
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const matches = matchesFor(DEMO_USER_ID, 6);
  const nextMatches = upcomingFor(DEMO_USER_ID);
  const joined = [...state.createdGames, ...openGames.filter((g) => state.joined[g.id])];
  const ach = achievementsFor(me);
  const regs = tournaments.filter((t) => state.registrations[t.id]);
  const history = tournaments.filter((t) => t.teams.some((tm) => tm.players.includes(DEMO_USER_ID)));
  const spent = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.paid, 0);

  const tabs = TABS.map((t) => ({ ...t, count: t.id === "bookings" ? upcoming.length : t.id === "games" ? joined.length + nextMatches.length : undefined }));

  let body;
  if (tab === "overview") {
    body = html`<div class="pov">
      <div class="pov__main">
        <${Block} title="Ближайшая игра"><${NextUp} booking=${upcoming[0]} match=${nextMatches[0]} /><//>
        <${Block} title="Мои бронирования" action=${html`<button class="alink" onClick=${() => setTab("bookings")}>Все · ${upcoming.length}</button>`}>
          ${upcoming.length ? upcoming.slice(0, 2).map((b) => html`<${BookingItem} key=${b.id} b=${b} />`) : html`<${Empty} title="Нет активных броней" action=${html`<${Button} to="/booking" size="sm">Забронировать корт<//>`} />`}
        <//>
        <${Block} title="Последние матчи" action=${html`<button class="alink" onClick=${() => setTab("games")}>Все игры</button>`}>
          ${matches.slice(0, 3).map((m) => html`<${MatchRow} key=${m.id} m=${m} me=${DEMO_USER_ID} />`)}
        <//>
      </div>
      <aside class="pov__side">
        <${Block} title="Сезон">
          <dl class="kv">
            <dt>Место в клубе</dt><dd>#${me.rank} из ${players.length}</dd>
            <dt>Бронирований</dt><dd>${bookings.filter((b) => b.status !== "cancelled").length}</dd>
            <dt>Оплачено</dt><dd>${rub(spent)}</dd>
            <dt>Турниры</dt><dd>${history.length + regs.length}</dd>
          </dl>
        <//>
        <${Block} title="Достижения" action=${html`<button class="alink" onClick=${() => setTab("achievements")}>${ach.filter((a) => a.done).length}/${ach.length}</button>`}>
          <div class="ach-mini">${ach.slice(0, 6).map((a) => html`<span key=${a.id} class=${cx("ach-mini__i", "ach--" + a.tier, a.done ? "is-done" : "is-locked")} title=${a.title}>${a.mark}</span>`)}</div>
        <//>
        <${Block} title="Турниры">
          ${regs.length
            ? regs.map((t) => html`<a key=${t.id} class="ptour" href=${href("/tournaments/" + t.id)}><span class="d-h4">${t.title}</span><span class="t-xs muted">${fmtDay(fromIso(t.date))} · ${t.format} ${t.level}</span></a>`)
            : html`<p class="t-sm muted">Вы пока не заявлены. <a class="alink" href=${href("/tournaments")}>Турниры</a></p>`}
        <//>
      </aside>
    </div>`;
  } else if (tab === "games") {
    body = html`<div class="pgames">
      <${Block} title="Предстоящие матчи">${nextMatches.length ? nextMatches.map((m) => html`<${MatchRow} key=${m.id} m=${m} me=${DEMO_USER_ID} />`) : html`<p class="t-sm muted">Нет запланированных матчей.</p>`}<//>
      <${Block} title="Мои заявки и игры" action=${html`<a class="alink" href=${href("/find-game")}>Найти игру <${Icon} name="arrowUpRight" size=${14} /></a>`}>
        ${joined.length ? joined.map((g) => html`<${GameTicket} key=${g.id} game=${g} />`) : html`<${Empty} title="Вы ещё не в составе" text="Откройте поиск игры и присоединитесь к заявке своего уровня." icon="ball" action=${html`<${Button} to="/find-game" size="sm">Найти игру<//>`} />`}
      <//>
      <${Block} title="История матчей">${matches.map((m) => html`<${MatchRow} key=${m.id} m=${m} me=${DEMO_USER_ID} />`)}<//>
    </div>`;
  } else if (tab === "bookings") {
    const lists = { upcoming, past, cancelled };
    const list = lists[bkFilter];
    body = html`<div class="pbk">
      <div class="pbk__bar">
        <${Chips}
          items=${[{ id: "upcoming", label: `Предстоящие · ${upcoming.length}` }, { id: "past", label: `Прошедшие · ${past.length}` }, { id: "cancelled", label: `Отменённые · ${cancelled.length}` }]}
          value=${bkFilter}
          onChange=${setBkFilter}
        />
        <${Button} to="/booking" size="sm" icon="plus">Новая бронь<//>
      </div>
      ${list.length
        ? list.map((b) => html`<${BookingItem} key=${b.id} b=${b} />`)
        : html`<${Empty} title=${bkFilter === "upcoming" ? "Нет предстоящих броней" : bkFilter === "past" ? "История пуста" : "Отмен нет"} text="Бронирования хранятся в этом браузере (демо)." />`}
    </div>`;
  } else if (tab === "rating") {
    body = html`<div class="prating">
      <${Block} title="Rating · 16 недель"><${RatingChart} data=${me.history} labels=${[{ i: 0, text: "16 нед." }, { i: 15, text: "сейчас" }]} /><//>
      <div class="prating__two">
        <div class="pexplain">
          <span class="label">Rating</span>
          <span class="num pexplain__n">${me.rating}</span>
          <p class="t-sm">Сила игры. Растёт за победы в рейтинговых матчах, сильнее — против пар с рейтингом выше. Определяет уровень: <b>${me.level}</b>.</p>
        </div>
        <div class="pexplain pexplain--xp">
          <span class="label">XP</span>
          <span class="num pexplain__n">${xp.toLocaleString("ru-RU")}</span>
          <p class="t-sm">Активность в клубе. Начисляется за всё, что вы делаете — даже за проигранный матч.</p>
          <ul class="xprules">${XP_RULES.map((r) => html`<li key=${r.label}><span>${r.label}</span><span class="num">+${r.xp}</span></li>`)}</ul>
        </div>
      </div>
    </div>`;
  } else if (tab === "tournaments") {
    body = html`<div class="ptours">
      <${Block} title="Заявки" action=${html`<a class="alink" href=${href("/tournaments")}>Все турниры <${Icon} name="arrowUpRight" size=${14} /></a>`}>
        ${regs.length
          ? regs.map((t) => {
              const reg = state.registrations[t.id];
              return html`<a key=${t.id} class="ptour ptour--big" href=${href("/tournaments/" + t.id)}>
                <span class="tag tag--lime">Вы участвуете</span>
                <span class="d-h3">${t.title}</span>
                <span class="t-sm muted">${fmtDay(fromIso(t.date))}, ${t.time} · ${t.format} ${t.level} · партнёр: ${playerById(reg.partner).name}</span>
              </a>`;
            })
          : html`<${Empty} title="Нет активных заявок" text="Ближайший турнир — PADEL 61 CUP. Осталось несколько мест." icon="trophy" action=${html`<${Button} to="/tournaments/padel61-cup" size="sm">Участвовать<//>`} />`}
      <//>
      <${Block} title="История">
        ${history.map((t) => {
          const team = teamsOf(t, null).find((tm) => tm.players.includes(DEMO_USER_ID));
          return html`<a key=${t.id} class="ptour" href=${href("/tournaments/" + t.id + "?tab=bracket")}>
            <span class="d-h4">${t.title}</span>
            <span class="t-sm muted">${fmtDay(fromIso(t.date))} · ${teamLabel(team)} · полуфинал</span>
          </a>`;
        })}
      <//>
    </div>`;
  } else if (tab === "achievements") {
    body = html`<div class="ach-grid">${ach.map((a, i) => html`<${AchievementBadge} key=${a.id} a=${a} i=${i} />`)}</div>`;
  } else {
    const s = state.settings;
    const Toggle = ({ k, label, hint }) => html`<label class="toggle">
      <span><b>${label}</b><br /><span class="t-xs muted">${hint}</span></span>
      <input type="checkbox" checked=${s[k]} onChange=${(e) => updateSettings({ [k]: e.target.checked })} />
      <span class="toggle__sw" aria-hidden="true"></span>
    </label>`;
    body = html`<div class="pset">
      <div class="pset__col">
        <div class="label muted">Уведомления</div>
        <${Toggle} k="notifyGames" label="Новые игры моего уровня" hint="Когда кто-то ищет игроков ${me.level}" />
        <${Toggle} k="notifyTournaments" label="Турниры" hint="Открытие регистрации и жеребьёвка" />
        <${Toggle} k="publicProfile" label="Публичный профиль" hint="Профиль и статистика видны в рейтинге" />
      </div>
      <div class="pset__col">
        <div class="label muted">Игра</div>
        <div class="pset__field"><span class="t-sm"><b>Рабочая рука</b></span><${Chips} items=${[{ id: "Правша", label: "Правша" }, { id: "Левша", label: "Левша" }]} value=${s.hand} onChange=${(v) => updateSettings({ hand: v })} /></div>
        <div class="pset__field"><span class="t-sm"><b>Сторона</b></span><${Chips} items=${[{ id: "Левая сторона", label: "Левая" }, { id: "Правая сторона", label: "Правая" }]} value=${s.side} onChange=${(v) => updateSettings({ side: v })} /></div>
        <div class="pset__danger">
          <${Button} variant="ghost" icon="logout" onClick=${() => { logout(); toast("Вы вышли из аккаунта"); }}>Выйти<//>
          <${Button} variant="text" icon=${null} onClick=${() => { resetDemo(); toast("Демо-данные сброшены"); navigate("/"); }}>Сбросить демо-данные<//>
        </div>
      </div>
    </div>`;
  }

  return html`
    <${AthleteHeader} p=${{ ...me, hand: state.settings.hand, side: state.settings.side }} xp=${xp}>
      <div class="pl-hero__top">
        <span class="label pf-k">Личный кабинет</span>
        <a class="btn btn--ghost btn--sm" href=${href("/players/" + DEMO_USER_ID)}><span class="btn__label">Публичный профиль</span><span class="btn__icon"><${Icon} name="arrowUpRight" size=${16} /></span></a>
      </div>
    <//>
    <section class="wrap ppage">
      <div class="ppage__tabs"><${Tabs} items=${tabs} value=${tab} onChange=${setTab} /></div>
      <div class="ppage__body" key=${tab}>${body}</div>
    </section>
  `;
}
