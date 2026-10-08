import { html, cx } from "../lib/html.js";
import { href } from "../lib/router.js";
import { useStore } from "../app/store.js";
import { playerById, players, DEMO_USER_ID } from "../data/players.js";
import { int, firstName, lastName, signed } from "../lib/format.js";
import { Avatar, LevelBadge, Button, Empty, CountUp, Form } from "../components/ui.js";
import { RatingChart } from "../components/graphics.js";
import { Icon } from "../components/Icon.js";
import { MatchRow } from "../features/matches/MatchRow.js";
import { matchesFor, upcomingFor } from "../features/matches/playerMatches.js";
import { achievementsFor, AchievementBadge, XpCard, Streak } from "../features/gamification/index.js";

/** Athlete header — shared by public player page and the personal cabinet. */
export function AthleteHeader({ p, xp, children }) {
  const pctTop = Math.round((p.rank / players.length) * 100);
  return html`<section class="pl-hero is-dark">
    <div class="pl-hero__rank num" aria-hidden="true">#${p.rank}</div>
    <div class="wrap pl-hero__in">
      ${children}
      <div class="pl-hero__grid">
        <div class="pl-hero__id">
          <div class="pl-hero__avatar" data-reveal>
            <${Avatar} name=${p.name} size=${132} />
            <${LevelBadge} level=${p.level} size="lg" class="pl-hero__lvl" />
          </div>
          <div>
            <div class="label pl-hero__k">Player · Padel 61 · с ${p.joined.replace("-", ".")}</div>
            <h1 class="pl-hero__name">
              <span class="d-h1" data-reveal="clip">${firstName(p.name)}</span>
              <span class="d-h1 pl-hero__last" data-reveal="clip" style="--rd:100ms">${lastName(p.name)}</span>
            </h1>
            <div class="pl-hero__tags t-sm">
              <span class="tag">#${p.rank} Club</span>
              <span class="tag">Топ ${pctTop}%</span>
              <span class="tag">${p.hand}</span>
              <span class="tag">${p.side}</span>
            </div>
          </div>
        </div>
        <div class="pl-hero__rating">
          <span class="label muted">Rating</span>
          <span class="num pl-hero__rv"><${CountUp} value=${p.rating} /></span>
          <span class=${cx("t-sm", p.delta >= 0 ? "pl-up" : "pl-down")}>${signed(p.delta)} за неделю</span>
        </div>
        <div class="pl-hero__xp"><${XpCard} xp=${xp} dark /></div>
      </div>
      <dl class="pl-stats">
        <div><dt class="label muted">Матчи</dt><dd class="num"><${CountUp} value=${p.matches} /></dd></div>
        <div><dt class="label muted">Победы</dt><dd class="num"><${CountUp} value=${p.wins} /></dd></div>
        <div><dt class="label muted">Поражения</dt><dd class="num"><${CountUp} value=${p.losses} /></dd></div>
        <div><dt class="label muted">Win rate</dt><dd class="num"><${CountUp} value=${p.winRate} />%</dd></div>
        <div><dt class="label muted">Streak</dt><dd><${Streak} streak=${p.streak} big /></dd></div>
      </dl>
    </div>
  </section>`;
}

export function PlayerPage({ params }) {
  const { state } = useStore();
  const p = playerById(params.id);
  if (!p) {
    return html`<section class="ptitle wrap"><${Empty} title="Игрок не найден" text="Проверьте ссылку или найдите игрока в рейтинге." action=${html`<${Button} to="/players">К рейтингу<//>`} /></section>`;
  }
  const isMe = p.id === DEMO_USER_ID;
  const xp = p.xp + (isMe ? state.xpBonus : 0);
  const matches = matchesFor(p.id, 6);
  const next = upcomingFor(p.id);
  const ach = achievementsFor(p);
  const done = ach.filter((a) => a.done).length;
  const idx = players.indexOf(p);
  const neighbours = players.slice(Math.max(0, idx - 2), idx + 3);

  return html`
    <${AthleteHeader} p=${p} xp=${xp}>
      <div class="pl-hero__top">
        <a class="ath__back t-sm" href=${href("/players")}><${Icon} name="arrowLeft" size=${16} /> Рейтинг</a>
        ${isMe
          ? html`<a class="btn btn--ghost btn--sm" href=${href("/profile")}><span class="btn__label">Это вы · Кабинет</span></a>`
          : html`<a class="btn btn--primary btn--sm" href=${href("/find-game")}><span class="btn__label">Позвать в игру</span><span class="btn__icon"><${Icon} name="arrow" size=${16} /></span></a>`}
      </div>
    <//>

    <section class="section wrap pl-body">
      <div class="pl-body__main">
        <div class="pl-block">
          <div class="pl-block__head"><span class="label">Rating · 16 недель</span><span class="t-sm muted">Наведите на график</span></div>
          <${RatingChart} data=${p.history} labels=${[{ i: 0, text: "16 нед." }, { i: 8, text: "8 нед." }, { i: 15, text: "сейчас" }]} />
        </div>

        <div class="pl-block">
          <div class="pl-block__head"><span class="label">Последние матчи</span><${Form} form=${p.form} /></div>
          ${next.map((m) => html`<${MatchRow} key=${m.id} m=${m} me=${p.id} />`)}
          ${matches.map((m) => html`<${MatchRow} key=${m.id} m=${m} me=${p.id} />`)}
        </div>
      </div>

      <aside class="pl-body__side">
        <div class="pl-block">
          <div class="pl-block__head"><span class="label">Рядом в рейтинге</span></div>
          <ol class="near">
            ${neighbours.map(
              (n) => html`<li key=${n.id}><a class=${cx("near__row", n.id === p.id && "is-cur")} href=${href("/players/" + n.id)}>
                <span class="num near__r">${n.rank}</span><span class="near__n">${n.name}</span><span class="num">${n.rating}</span>
              </a></li>`
            )}
          </ol>
        </div>
      </aside>
    </section>

    <section class="section--tight wrap pl-ach">
      <div class="pl-block__head"><span class="label">Достижения</span><span class="t-sm muted">${done} из ${ach.length} открыто</span></div>
      <div class="ach-grid">${ach.map((a, i) => html`<${AchievementBadge} key=${a.id} a=${a} i=${i} />`)}</div>
    </section>
  `;
}
