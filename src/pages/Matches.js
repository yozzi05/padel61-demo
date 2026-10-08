import { html, useState } from "../lib/html.js";
import { href } from "../lib/router.js";
import { recentMatches, upcomingMatches } from "../data/matches.js";
import { openGames } from "../data/openGames.js";
import { relDay } from "../lib/date.js";
import { Tabs, Button } from "../components/ui.js";
import { Icon } from "../components/Icon.js";
import { MatchRow } from "../features/matches/MatchRow.js";
import { GameTicket } from "../features/matches/GameTicket.js";

function groupByDay(list) {
  const out = [];
  list.forEach((m) => {
    const last = out[out.length - 1];
    if (last && last.date === m.date) last.items.push(m);
    else out.push({ date: m.date, items: [m] });
  });
  return out;
}

export function MatchesPage({ query }) {
  const [tab, setTab] = useState(query.tab || "recent");
  const live = upcomingMatches.find((m) => m.status === "live");
  const tabs = [
    { id: "recent", label: "Последние", count: recentMatches.length },
    { id: "upcoming", label: "Будущие", count: upcomingMatches.length },
    { id: "search", label: "Поиск игры", count: openGames.length },
  ];

  return html`
    <section class="ptitle wrap mt-title">
      <div class="ptitle__meta"><span class="label">Matches</span><span class="label muted">Лента матчей клуба</span></div>
      <div class="ptitle__row">
        <h1 class="d-h1 ptitle__h" data-reveal="clip">Матчи</h1>
        ${live
          ? html`<a class="mt-live is-dark" href=${href("/matches?tab=upcoming")} onClick=${(e) => { e.preventDefault(); setTab("upcoming"); }} data-reveal>
              <span class="live-tag">LIVE</span>
              <span class="mt-live__score num">${live.live.sets.map((s) => s.join(":")).join("  ")}</span>
              <span class="t-xs muted">Корт 03 · ${relDay(live.date)}, ${live.time}</span>
            </a>`
          : null}
      </div>
    </section>

    <section class="wrap mt">
      <${Tabs} items=${tabs} value=${tab} onChange=${setTab} />
      <div class="mt__body">
        ${tab === "recent"
          ? groupByDay(recentMatches).map(
              (g) => html`<div key=${g.date} class="mt__day">
                <div class="mt__date label">${relDay(g.date)}</div>
                <div>${g.items.map((m) => html`<${MatchRow} key=${m.id} m=${m} />`)}</div>
              </div>`
            )
          : tab === "upcoming"
            ? groupByDay(upcomingMatches).map(
                (g) => html`<div key=${g.date} class="mt__day">
                  <div class="mt__date label">${relDay(g.date)}</div>
                  <div>${g.items.map((m) => html`<${MatchRow} key=${m.id} m=${m} />`)}</div>
                </div>`
              )
            : html`<div class="mt__search">
                <div class="mt__search-head">
                  <p class="lead">Открытые заявки игроков. Присоединяйтесь — или создайте свою.</p>
                  <${Button} to="/find-game" variant="dark" icon="search">Расширенный поиск<//>
                </div>
                <div class="og__list">${openGames.slice(0, 4).map((g) => html`<${GameTicket} key=${g.id} game=${g} />`)}</div>
              </div>`}
      </div>
    </section>
  `;
}
