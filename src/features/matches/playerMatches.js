// Player match history: curated club feed + deterministic fill that matches the player's recent form.
import { recentMatches, upcomingMatches } from "../../data/matches.js";
import { players, playerById } from "../../data/players.js";
import { courts } from "../../data/courts.js";
import { isoIn } from "../../lib/date.js";
import { rng, between, pick } from "../../lib/random.js";

const sideOf = (m, id) => (m.teamA.includes(id) ? "A" : m.teamB.includes(id) ? "B" : null);

function genSets(r, winnerA) {
  const close = r() < 0.4;
  const w = () => [6, between(r, 1, 4)];
  const sets = close ? [w(), [between(r, 3, 5), 6], [10, between(r, 5, 8)]] : [w(), w()];
  if (close && r() < 0.5) sets[2] = [between(r, 6, 8), 10].reverse();
  return sets.map(([a, b]) => (winnerA ? [a, b] : [b, a]));
}

export function matchesFor(id, count = 6) {
  const p = playerById(id);
  const own = recentMatches.filter((m) => sideOf(m, id));
  const out = [...own];
  const r = rng("hist-" + id);
  const pool = players.filter((x) => x.id !== id && Math.abs(x.rating - p.rating) < 260);
  let k = 0;
  while (out.length < count && k < 20) {
    const res = p.form[out.length] || (r() < p.winRate / 100 ? "W" : "L");
    const others = [...pool].sort(() => r() - 0.5).slice(0, 3);
    if (others.length < 3) break;
    const winA = res === "W";
    out.push({
      id: `gen-${id}-${k}`,
      date: isoIn(-(3 + out.length * 3 + between(r, 0, 2))),
      time: pick(r, ["18:00", "19:00", "19:30", "20:00", "21:00"]),
      courtId: pick(r, courts).id,
      type: "rated",
      teamA: [id, others[0].id],
      teamB: [others[1].id, others[2].id],
      sets: genSets(r, winA),
      winner: winA ? "A" : "B",
      delta: winA ? between(r, 6, 19) : -between(r, 6, 15),
    });
    k++;
  }
  return out.slice(0, count).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const upcomingFor = (id) => upcomingMatches.filter((m) => sideOf(m, id));

/** Result from a given player's perspective */
export function perspective(m, id) {
  const side = sideOf(m, id);
  if (!side || !m.winner) return null;
  const won = m.winner === side;
  // Delta is stored for team A in the club feed
  const d = Math.abs(m.delta || 0);
  return { won, delta: won ? d : -d };
}
