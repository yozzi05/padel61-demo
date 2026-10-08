// Mock club ranking. Rating = strength (Elo-like). XP = activity. They are never mixed.
import { rng, between } from "../lib/random.js";

export const DEMO_USER_ID = "ivan-petrov";

// [id, name, gender, rating, overrides?]
const RAW = [
  ["maksim-orlov", "Максим Орлов", "m", 1892],
  ["anna-smirnova", "Анна Смирнова", "f", 1846],
  ["georgiy-arakelyan", "Георгий Аракелян", "m", 1811],
  ["timur-aliev", "Тимур Алиев", "m", 1764],
  ["mariya-kovaleva", "Мария Ковалёва", "f", 1731],
  ["dmitriy-volkov", "Дмитрий Волков", "m", 1702],
  ["aleksey-kuznetsov", "Алексей Кузнецов", "m", 1688],
  ["darya-fedorova", "Дарья Фёдорова", "f", 1652],
  ["artem-belov", "Артём Белов", "m", 1634],
  ["nikita-morozov", "Никита Морозов", "m", 1619],
  ["polina-mironova", "Полина Миронова", "f", 1601],
  ["sergey-lebedev", "Сергей Лебедев", "m", 1594],
  ["vladislav-kim", "Владислав Ким", "m", 1581],
  [DEMO_USER_ID, "Иван Петров", "m", 1568, { matches: 38, wins: 24, streak: 4, xp: 8420, joined: "2025-04" }],
  ["elena-vasileva", "Елена Васильева", "f", 1544],
  ["andrey-sokolov", "Андрей Соколов", "m", 1521],
  ["kirill-pavlov", "Кирилл Павлов", "m", 1498],
  ["kseniya-romanova", "Ксения Романова", "f", 1476],
  ["roman-zaytsev", "Роман Зайцев", "m", 1452],
  ["ilya-novikov", "Илья Новиков", "m", 1431],
  ["alina-guseva", "Алина Гусева", "f", 1407],
  ["egor-semenov", "Егор Семёнов", "m", 1384],
  ["viktoriya-titova", "Виктория Титова", "f", 1352],
  ["pavel-golubev", "Павел Голубев", "m", 1318],
  ["sofiya-karpova", "София Карпова", "f", 1287],
  ["denis-melnikov", "Денис Мельников", "m", 1254],
  ["olga-nikitina", "Ольга Никитина", "f", 1198],
  ["oleg-frolov", "Олег Фролов", "m", 1163],
];

export function levelFor(rating) {
  if (rating >= 1750) return "A";
  if (rating >= 1550) return "B+";
  if (rating >= 1450) return "B";
  if (rating >= 1350) return "C+";
  if (rating >= 1250) return "C";
  return "D";
}

/** XP → club level. level = floor(sqrt(xp / 25)) → L18 at 8 100 XP, L19 at 9 025 XP. */
export const xpLevel = (xp) => Math.floor(Math.sqrt(xp / 25));
export const xpForLevel = (lvl) => 25 * lvl * lvl;

function build([id, name, gender, rating, o = {}], i) {
  const r = rng(id);
  const matches = o.matches ?? between(r, 14, 96);
  const strength = (rating - 1150) / 750; // 0..1
  const wr = Math.min(0.82, Math.max(0.28, 0.36 + strength * 0.4 + (r() - 0.5) * 0.12));
  const wins = o.wins ?? Math.round(matches * wr);
  const losses = matches - wins;
  const streak = o.streak ?? (r() > 0.42 ? between(r, 1, 6) : -between(r, 1, 3));
  const xp = o.xp ?? Math.round(matches * 175 + r() * 2200 + 400);

  // Recent form, newest first
  const form = [];
  for (let k = 0; k < 5; k++) {
    if (streak > 0 && k < streak) form.push("W");
    else if (streak < 0 && k < -streak) form.push("L");
    else if (k === Math.abs(streak)) form.push(streak > 0 ? "L" : "W");
    else form.push(r() < wr ? "W" : "L");
  }

  // Rating history — 16 weekly points ending at the current rating
  const history = [rating];
  for (let k = 1; k < 16; k++) {
    const prev = history[k - 1];
    history.push(Math.round(prev - (r() - 0.38) * 34));
  }
  history.reverse();

  const delta = rating - history[history.length - 2];

  return {
    id,
    name,
    gender,
    rating,
    level: levelFor(rating),
    rank: i + 1,
    prevRank: Math.max(1, i + 1 + (delta > 10 ? between(r, 1, 3) : delta < -8 ? -between(r, 1, 2) : 0)),
    matches,
    wins,
    losses,
    winRate: Math.round((wins / matches) * 100),
    streak,
    form,
    xp,
    xpLevel: xpLevel(xp),
    history,
    delta,
    joined: o.joined ?? `202${between(r, 3, 5)}-${String(between(r, 1, 12)).padStart(2, "0")}`,
    hand: r() > 0.86 ? "Левша" : "Правша",
    side: r() > 0.5 ? "Левая сторона" : "Правая сторона",
  };
}

export const players = RAW.map(build);
export const playerById = (id) => players.find((p) => p.id === id);
