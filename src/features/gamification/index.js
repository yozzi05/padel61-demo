// Gamification: achievements, XP level card, streak. Rating and XP are shown separately on purpose.
import { html, cx } from "../../lib/html.js";
import { achievements, demoProgress, TIER_LABEL } from "../../data/achievements.js";
import { DEMO_USER_ID, xpLevel, xpForLevel } from "../../data/players.js";
import { tournaments } from "../../data/tournaments.js";
import { fromIso, fmtDayShort } from "../../lib/date.js";
import { int } from "../../lib/format.js";
import { Icon } from "../../components/Icon.js";
import { Meter, CountUp } from "../../components/ui.js";

/** Achievement progress for any player (demo user has curated progress). */
export function achievementsFor(p) {
  if (p.id === DEMO_USER_ID) return achievements.map((a) => ({ ...a, ...demoProgress[a.id] }));
  const champs = tournaments.filter((t) => t.status === "finished").flatMap((t) => {
    const f = t.bracket[t.bracket.length - 1].matches[0];
    const team = t.teams.find((x) => x.id === (f.winner === "a" ? f.a : f.b));
    return team ? team.players : [];
  });
  const has = {
    "first-win": p.wins > 0,
    "streak-5": p.streak >= 5,
    "matches-10": p.matches >= 10,
    "matches-50": p.matches >= 50,
    "matches-100": p.matches >= 100,
    "giant-killer": p.rank > 6 && p.winRate > 50,
    "tournament-win": champs.includes(p.id),
    "partners-10": p.matches >= 25,
    "top-10": p.rank <= 10,
    "number-one": p.rank === 1,
  };
  const progress = {
    "streak-5": [Math.max(0, p.streak), 5],
    "matches-10": [p.matches, 10],
    "matches-50": [p.matches, 50],
    "matches-100": [p.matches, 100],
    "partners-10": [Math.min(9, Math.floor(p.matches / 3)), 10],
    "tournament-win": [0, 1],
    "first-win": [p.wins, 1],
  };
  return achievements.map((a) => {
    const [value, target] = progress[a.id] || [];
    return { ...a, done: has[a.id], value, target, inverse: a.id === "top-10" || a.id === "number-one" ? true : undefined, ...(a.id === "top-10" || a.id === "number-one" ? { value: p.rank, target: a.id === "top-10" ? 10 : 1 } : {}) };
  });
}

export function AchievementBadge({ a, i = 0 }) {
  const pct = a.done ? 1 : a.inverse ? Math.max(0, Math.min(1, (28 - a.value) / (28 - a.target))) : a.target ? Math.min(1, (a.value || 0) / a.target) : 0;
  return html`<article class=${cx("ach", "ach--" + a.tier, a.done ? "is-done" : "is-locked")} data-reveal style=${{ "--rd": i * 50 + "ms" }}>
    <div class="ach__tile">
      <span class="ach__mark">${a.mark}</span>
      <span class="ach__unit vlabel">${a.unit}</span>
      ${a.done ? null : html`<span class="ach__lock"><${Icon} name="lock" size=${14} /></span>`}
    </div>
    <div class="ach__body">
      <div class="ach__top">
        <span class="label label-sm ach__tier">${TIER_LABEL[a.tier]}</span>
        <span class="label label-sm muted">+${a.xp} XP</span>
      </div>
      <h4 class="ach__t">${a.title}</h4>
      <p class="t-xs muted">${a.desc}</p>
      ${a.done
        ? html`<span class="ach__state t-xs"><${Icon} name="check" size=${14} /> ${a.date ? "Получено " + fmtDayShort(fromIso(a.date)) : "Получено"}</span>`
        : a.target != null
          ? html`<div class="ach__prog"><${Meter} value=${pct} max=${1} label=${a.title} /><span class="t-xs muted tabular">${a.inverse ? `сейчас #${a.value} → #${a.target}` : `${Math.min(a.value || 0, a.target)} / ${a.target}`}</span></div>`
          : null}
    </div>
  </article>`;
}

/** LEVEL 18 · 8 420 XP — activity, not strength. */
export function XpCard({ xp, dark, compact }) {
  const lvl = xpLevel(xp);
  const from = xpForLevel(lvl);
  const to = xpForLevel(lvl + 1);
  return html`<div class=${cx("xpc", dark && "xpc--dark", compact && "xpc--compact")}>
    <div class="xpc__row">
      <div class="xpc__lvl"><span class="label muted">Level</span><span class="num xpc__n"><${CountUp} value=${lvl} /></span></div>
      <div class="xpc__xp"><span class="label muted">XP</span><span class="num xpc__x"><${CountUp} value=${xp} format=${(n) => int(n)} /></span></div>
    </div>
    <${Meter} value=${xp - from} max=${to - from} dark=${dark} label="Прогресс уровня" />
    <div class="xpc__foot t-xs muted"><span>LVL ${lvl}</span><span>ещё ${int(to - xp)} XP до LVL ${lvl + 1}</span></div>
  </div>`;
}

export function Streak({ streak, big }) {
  const win = streak > 0;
  return html`<span class=${cx("streak", win ? "streak--w" : "streak--l", big && "streak--big")}>
    ${win ? html`<${Icon} name="flame" size=${big ? 22 : 14} />` : null}
    <span class="num">${Math.abs(streak)}</span>
    <span class="streak__l">${win ? "WINS" : "LOSSES"}</span>
  </span>`;
}
