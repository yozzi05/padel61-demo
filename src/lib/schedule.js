// Mock court occupancy. Deterministic per court + day, merged with the user's own bookings.
import { OPEN_MIN, CLOSE_MIN, SLOT, courts } from "../data/courts.js";
import { rng, between } from "./random.js";
import { iso, today, toMin, fromMin, nowMin } from "./date.js";

const cache = new Map();

/** Club bookings that are not the user's: [{ start, end }] in minutes. */
export function clubBlocks(courtId, dateIso) {
  const key = courtId + dateIso;
  if (cache.has(key)) return cache.get(key);
  const r = rng(key);
  const blocks = [];
  let t = OPEN_MIN + between(r, 0, 3) * SLOT;
  while (t < CLOSE_MIN - 60) {
    const evening = t >= 17 * 60;
    const morning = t < 10 * 60;
    const busyChance = evening ? 0.72 : morning ? 0.45 : 0.3;
    if (r() < busyChance) {
      const len = [60, 90, 90, 120][between(r, 0, 3)];
      const end = Math.min(t + len, CLOSE_MIN);
      blocks.push({ start: t, end });
      t = end;
    } else {
      t += SLOT * between(r, 1, 3);
    }
  }
  cache.set(key, blocks);
  return blocks;
}

export function userBlocks(bookings, courtId, dateIso) {
  return bookings
    .filter((b) => b.courtId === courtId && b.date === dateIso && b.status !== "cancelled")
    .map((b) => ({ start: toMin(b.start), end: toMin(b.start) + b.duration, mine: true, id: b.id }));
}

export function dayBlocks(bookings, courtId, dateIso) {
  return [...clubBlocks(courtId, dateIso), ...userBlocks(bookings, courtId, dateIso)].sort((a, b) => a.start - b.start);
}

/** Every 30-minute slot of the day with its state. */
export function daySlots(bookings, courtId, dateIso) {
  const blocks = dayBlocks(bookings, courtId, dateIso);
  const isToday = dateIso === iso(today());
  const now = nowMin();
  const out = [];
  for (let t = OPEN_MIN; t < CLOSE_MIN; t += SLOT) {
    const block = blocks.find((b) => b.mine && t >= b.start && t < b.end) || blocks.find((b) => t >= b.start && t < b.end);
    let state = "free";
    if (block) state = block.mine ? "mine" : "busy";
    else if (isToday && t + SLOT <= now) state = "past";
    out.push({ min: t, label: fromMin(t), state });
  }
  return out;
}

export function rangeIsFree(slots, startMin, duration) {
  if (startMin + duration > CLOSE_MIN) return false;
  return slots.filter((s) => s.min >= startMin && s.min < startMin + duration).every((s) => s.state === "free");
}

export function freeShare(bookings, courtId, dateIso) {
  const s = daySlots(bookings, courtId, dateIso);
  return s.filter((x) => x.state === "free").length / s.length;
}

/**
 * Board clock. Inside opening hours it is the real time; at night the demo board
 * replays a typical evening (19:40) on tomorrow's schedule so the club never looks "dead".
 */
export function boardClock() {
  const n = nowMin();
  if (n >= OPEN_MIN && n < CLOSE_MIN - SLOT) return { min: n, date: iso(today()), simulated: false };
  const d = new Date(today());
  if (n >= CLOSE_MIN - SLOT) d.setDate(d.getDate() + 1);
  return { min: 19 * 60 + 40, date: iso(d), simulated: true };
}

/** Live status of a court at board time. */
export function liveStatus(bookings, court) {
  const { min: now, date: d } = boardClock();
  const blocks = dayBlocks(bookings, court.id, d);
  const current = blocks.find((b) => now >= b.start && now < b.end);
  const next = blocks.find((b) => b.start > now);
  if (current) {
    return {
      kind: "live",
      label: "ИГРА ИДЁТ",
      sub: `освободится через ${current.end - now} мин`,
      until: current.end,
      progress: (now - current.start) / (current.end - current.start),
      next,
    };
  }
  const freeUntil = next ? next.start : CLOSE_MIN;
  return {
    kind: "free",
    label: "СВОБОДЕН",
    sub: `до ${fromMin(freeUntil)}`,
    until: freeUntil,
    next,
  };
}

/** Next free start times today across all courts (for hero "UP NEXT"). */
export function nextFreeSlots(bookings, limit = 4) {
  const { min: now, date: d, simulated } = boardClock();
  const out = [];
  for (const c of courts) {
    const slots = daySlots(bookings, c.id, d);
    const from = simulated ? OPEN_MIN + 10 * 60 : now - (now % SLOT) + SLOT;
    const first = slots.find((s) => s.state === "free" && s.min >= from && rangeIsFree(slots, s.min, 60));
    if (first) out.push({ court: c, slot: first, date: d });
  }
  return out.sort((a, b) => a.slot.min - b.slot.min).slice(0, limit);
}
