// Mock coach schedule: which full hours a coach is free on a given day.
import { rng } from "../../lib/random.js";
import { iso, today, addDays, nowMin } from "../../lib/date.js";

const HOURS = Array.from({ length: 15 }, (_, i) => 7 + i); // 07..21

export function coachFreeHours(coachId, dateIso, bookings = []) {
  const r = rng(coachId + "|" + dateIso);
  const isToday = dateIso === iso(today());
  const mine = bookings.filter((b) => b.kind === "training" && b.coachId === coachId && b.date === dateIso && b.status !== "cancelled").map((b) => parseInt(b.start, 10));
  return HOURS.map((h) => {
    let state = r() < (h >= 17 ? 0.55 : 0.35) ? "busy" : "free";
    if (isToday && h * 60 <= nowMin()) state = "past";
    if (mine.includes(h)) state = "mine";
    return { h, label: `${String(h).padStart(2, "0")}:00`, state };
  });
}

/** Next free windows over the following days (coach profile). */
export function nextWindows(coachId, count = 6, bookings) {
  const out = [];
  for (let d = 0; d < 7 && out.length < count; d++) {
    const date = iso(addDays(today(), d));
    coachFreeHours(coachId, date, bookings)
      .filter((s) => s.state === "free")
      .slice(0, 2)
      .forEach((s) => out.length < count && out.push({ date, ...s }));
  }
  return out;
}
