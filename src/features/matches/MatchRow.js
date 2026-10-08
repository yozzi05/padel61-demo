// Broadcast-style scoreboard row for a match (finished, live or upcoming).
import { html, cx } from "../../lib/html.js";
import { href } from "../../lib/router.js";
import { relDay } from "../../lib/date.js";
import { shortName, signed } from "../../lib/format.js";
import { playerById, DEMO_USER_ID } from "../../data/players.js";
import { courtById } from "../../data/courts.js";
import { LevelBadge } from "../../components/ui.js";
import { perspective } from "./playerMatches.js";

const TYPE = { rated: "Рейтинговый", friendly: "Товарищеский", tournament: "Турнир" };

function Team({ ids, sets, side, winner, serving, live }) {
  const won = winner === side;
  return html`<div class=${cx("sb__team", won && "is-win", winner && !won && "is-lose")}>
    <span class="sb__mark" aria-hidden="true">${serving === side ? html`<i class="sb__serve"></i>` : null}</span>
    <span class="sb__names">
      ${ids.map((id, i) => {
        const p = playerById(id);
        return html`${i ? html`<span class="sb__slash">/</span>` : null}<a key=${id} class=${cx("sb__p", id === DEMO_USER_ID && "is-me")} href=${href("/players/" + id)}>${shortName(p.name)}</a>`;
      })}
    </span>
    <span class="sb__lvl"><${LevelBadge} level=${playerById(ids[0]).level} size="sm" /></span>
    <span class="sb__sets">
      ${sets.map((s, i) => {
        const mine = s[side === "A" ? 0 : 1];
        const theirs = s[side === "A" ? 1 : 0];
        const current = live && i === sets.length - 1;
        return html`<span key=${i} class=${cx("sb__set num", mine > theirs && !current && "is-up", current && "is-cur")}>${mine}</span>`;
      })}
    </span>
  </div>`;
}

export function MatchRow({ m, me, compact }) {
  const court = courtById(m.courtId);
  const live = m.status === "live";
  const upcoming = m.status === "upcoming";
  const sets = live ? m.live.sets : m.sets || [];
  const pv = me ? perspective(m, me) : null;

  return html`<article class=${cx("sb", live && "sb--live", upcoming && "sb--next", compact && "sb--compact")}>
    <div class="sb__meta">
      ${live
        ? html`<span class="live-tag">LIVE</span>`
        : upcoming
          ? html`<span class="label sb__next">Up next</span>`
          : html`<span class="label muted">${relDay(m.date)}</span>`}
      <span class="num sb__time">${m.time}</span>
      <span class="t-xs muted">Корт ${court.no} · ${TYPE[m.type] || ""}</span>
    </div>
    <div class="sb__board">
      <${Team} ids=${m.teamA} sets=${sets} side="A" winner=${m.winner} serving=${live && m.live.serving} live=${live} />
      <div class="sb__vs label label-sm" aria-hidden="true">VS</div>
      <${Team} ids=${m.teamB} sets=${sets} side="B" winner=${m.winner} serving=${live && m.live.serving} live=${live} />
    </div>
    <div class="sb__res">
      ${pv
        ? html`<span class=${cx("sb__wl num", pv.won ? "is-win" : "is-loss")}>${pv.won ? "WIN" : "LOSS"}</span>
            <span class=${cx("sb__delta t-sm", pv.delta >= 0 ? "is-up" : "is-down")}>${signed(pv.delta)} rating</span>`
        : live
          ? html`<span class="label">Сет ${sets.length}</span><span class="t-sm muted">идёт игра</span>`
          : upcoming
            ? html`<span class="label">${relDay(m.date)}</span><span class="t-sm muted">${court.short}</span>`
            : m.delta
              ? html`<span class="label muted">Rating</span><span class="num sb__pm">±${Math.abs(m.delta)}</span>`
              : html`<span class="label muted">Rating</span><span class="t-sm muted">без рейтинга</span>`}
    </div>
  </article>`;
}
