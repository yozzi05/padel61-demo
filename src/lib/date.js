const WD_SHORT = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const WD_FULL = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const MON_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MON_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export const pad = (n) => String(n).padStart(2, "0");

export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function fromIso(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
/** ISO date for "today + n days" — mock data is anchored to the real current date. */
export const isoIn = (n) => iso(addDays(today(), n));

export const weekdayShort = (d) => WD_SHORT[d.getDay()];
export const weekdayFull = (d) => WD_FULL[d.getDay()];
export const monthShort = (d) => MON_SHORT[d.getMonth()];
export const fmtDay = (d) => `${d.getDate()} ${MON_GEN[d.getMonth()]}`;
export const fmtDayShort = (d) => `${d.getDate()} ${MON_SHORT[d.getMonth()]}`;

export function relDay(isoStr) {
  const diff = Math.round((fromIso(isoStr) - today()) / 864e5);
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  if (diff === -1) return "Вчера";
  const d = fromIso(isoStr);
  return `${weekdayShort(d)}, ${fmtDayShort(d)}`;
}

/** Minutes since midnight <-> "HH:MM" */
export const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
export const nowMin = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} мин`;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}
