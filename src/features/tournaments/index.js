// Tournament helpers + bracket / group table components.
import { html, cx } from "../../lib/html.js";
import { href } from "../../lib/router.js";
import { playerById, DEMO_USER_ID } from "../../data/players.js";
import { courtById } from "../../data/courts.js";
import { shortName, lastName } from "../../lib/format.js";
import { Avatar } from "../../components/ui.js";
import { Icon } from "../../components/Icon.js";

export const MY_TEAM_ID = "me";

/** Teams including the demo user's registration. */
export function teamsOf(t, registration) {
  if (!registration) return t.teams;
  return [...t.teams, { id: MY_TEAM_ID, players: [DEMO_USER_ID, registration.partner] }];
}

export const teamById = (teams, id) => teams.find((x) => x.id === id);
export const teamLabel = (team) => (team ? team.players.map((id) => lastName(playerById(id).name)).join(" / ") : "TBD");
export const teamRating = (team) => Math.round(team.players.reduce((s, id) => s + playerById(id).rating, 0) / team.players.length);

export function standings(group) {
  const rows = group.teams.map((id) => ({ id, p: 0, w: 0, l: 0, sw: 0, sl: 0, gw: 0, gl: 0 }));
  const row = (id) => rows.find((r) => r.id === id);
  group.matches.filter((m) => m.status === "done").forEach((m) => {
    const a = row(m.a);
    const b = row(m.b);
    a.p++; b.p++;
    m.sets.forEach(([x, y]) => {
      a.gw += x; a.gl += y; b.gw += y; b.gl += x;
      if (x > y) { a.sw++; b.sl++; } else { b.sw++; a.sl++; }
    });
    if (m.winner === "a") { a.w++; b.l++; } else { b.w++; a.l++; }
  });
  return rows
    .map((r) => ({ ...r, pts: r.w * 2 }))
    .sort((x, y) => y.pts - x.pts || y.sw - y.sl - (x.sw - x.sl) || y.gw - y.gl - (x.gw - x.gl));
}

export function GroupTable({ group, teams }) {
  const rows = standings(group);
  return html`<div class="gt">
    <div class="gt__head"><span class="d-h3">Группа ${group.name}</span><span class="label muted">${group.matches.filter((m) => m.status === "done").length}/${group.matches.length} матчей</span></div>
    <table class="gt__table">
      <thead><tr class="label label-sm"><th>#</th><th>Пара</th><th>И</th><th>В</th><th>П</th><th>Сеты</th><th>Очки</th></tr></thead>
      <tbody>
        ${rows.map((r, i) => {
          const team = teamById(teams, r.id);
          return html`<tr key=${r.id} class=${cx(i < 2 && "is-q")}>
            <td class="num">${i + 1}</td>
            <td class="gt__team">${teamLabel(team)}</td>
            <td>${r.p}</td><td>${r.w}</td><td>${r.l}</td>
            <td class="tabular">${r.sw}:${r.sl}</td>
            <td class="num gt__pts">${r.pts}</td>
          </tr>`;
        })}
      </tbody>
    </table>
    <div class="gt__note t-xs muted"><i class="gt__q"></i> Выход в плей-офф</div>
  </div>`;
}

function BracketTeam({ team, side, m }) {
  const won = m.winner === side;
  const mine = team && team.players.includes(DEMO_USER_ID);
  return html`<div class=${cx("bt", won && "is-win", m.winner && !won && "is-lose", !team && "is-tbd", mine && "is-me")}>
    <span class="bt__seed">${team ? html`<${Avatar} name=${playerById(team.players[0]).name} size=${20} />` : null}</span>
    <span class="bt__name">${team ? team.players.map((id) => shortName(playerById(id).name)).join(" / ") : "TBD"}</span>
    <span class="bt__sets">
      ${m.sets.map((s, i) => {
        const v = s[side === "a" ? 0 : 1];
        const o = s[side === "a" ? 1 : 0];
        return html`<span key=${i} class=${cx("num", v > o && "is-up", m.status === "live" && i === m.sets.length - 1 && "is-cur")}>${v}</span>`;
      })}
    </span>
  </div>`;
}

export function Bracket({ rounds, teams, placeholder }) {
  const final = rounds[rounds.length - 1].matches[0];
  const champ = final.winner ? teamById(teams, final.winner === "a" ? final.a : final.b) : null;
  return html`<div class=${cx("bracket", placeholder && "bracket--ph")} style=${{ "--rows": Math.max(2, rounds[0].matches.length) }}>
    ${rounds.map(
      (r, ri) => html`<div key=${r.name} class="bracket__col" style=${{ "--n": r.matches.length }}>
        <div class="bracket__h label">${r.name}</div>
        <div class="bracket__matches">
          ${r.matches.map(
            (m) => html`<div key=${m.id} class=${cx("bslot", ri < rounds.length - 1 && "bslot--next", ri > 0 && "bslot--prev")}><div class=${cx("bm", m.status === "live" && "bm--live")}>
              <div class="bm__meta label label-sm">
                ${m.status === "live" ? html`<span class="live-tag">LIVE</span>` : m.status === "done" ? html`<span class="muted">Сыгран</span>` : html`<span class="muted">${m.time || "—"}</span>`}
                ${m.court ? html`<span class="muted">Корт ${courtById(m.court).no}</span>` : null}
              </div>
              <${BracketTeam} team=${teamById(teams, m.a)} side="a" m=${m} />
              <${BracketTeam} team=${teamById(teams, m.b)} side="b" m=${m} />
            </div></div>`
          )}
        </div>
      </div>`
    )}
    <div class="bracket__col bracket__col--champ">
      <div class="bracket__h label">Чемпион</div>
      <div class="bracket__matches">
        <div class=${cx("champ", champ && "is-set")}>
          <${Icon} name="trophy" size=${28} />
          <span class="d-h4">${champ ? teamLabel(champ) : "Определится в финале"}</span>
          ${champ ? html`<span class="t-xs">${champ.players.map((id) => playerById(id).name).join(" · ")}</span>` : null}
        </div>
      </div>
    </div>
  </div>`;
}

/** Empty bracket preview for tournaments still in registration. */
export function placeholderRounds(capacity) {
  const names = { 16: ["1/8 финала", "1/4 финала", "Полуфинал", "Финал"], 12: ["1/4 финала", "Полуфинал", "Финал"], 8: ["1/4 финала", "Полуфинал", "Финал"] };
  const list = names[capacity] || names[8];
  let n = Math.pow(2, list.length - 1);
  return list.map((name, i) => {
    const r = { name, matches: Array.from({ length: n }, (_, k) => ({ id: `ph-${i}-${k}`, a: null, b: null, sets: [], winner: null, status: "scheduled" })) };
    n /= 2;
    return r;
  });
}

export function TeamRow({ team, i }) {
  const mine = team.players.includes(DEMO_USER_ID);
  return html`<div class=${cx("trow", mine && "is-me")}>
    <span class="num trow__seed">${String(i + 1).padStart(2, "0")}</span>
    <span class="trow__players">
      ${team.players.map((id) => {
        const p = playerById(id);
        return html`<a key=${id} class="trow__p" href=${href("/players/" + id)}><${Avatar} name=${p.name} size=${32} /><span><b>${p.name}</b><span class="t-xs muted">${p.level} · ${p.rating}</span></span></a>`;
      })}
    </span>
    <span class="trow__r"><span class="label muted">Avg</span><span class="num">${teamRating(team)}</span></span>
  </div>`;
}
