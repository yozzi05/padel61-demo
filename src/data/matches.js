// Club match feed (mock). Dates are relative to "today" so the demo never goes stale.
import { isoIn } from "../lib/date.js";

// sets are [teamA, teamB]; third set is a super tie-break to 10
export const recentMatches = [
  { id: "m-101", date: isoIn(-1), time: "20:00", courtId: "indoor", type: "rated",
    teamA: ["ivan-petrov", "aleksey-kuznetsov"], teamB: ["maksim-orlov", "artem-belov"],
    sets: [[6, 4], [3, 6], [10, 8]], winner: "A", delta: 18 },
  { id: "m-102", date: isoIn(-1), time: "18:30", courtId: "tent", type: "rated",
    teamA: ["anna-smirnova", "timur-aliev"], teamB: ["mariya-kovaleva", "dmitriy-volkov"],
    sets: [[7, 5], [6, 3]], winner: "A", delta: 11 },
  { id: "m-103", date: isoIn(-2), time: "21:00", courtId: "open", type: "friendly",
    teamA: ["kirill-pavlov", "kseniya-romanova"], teamB: ["roman-zaytsev", "alina-guseva"],
    sets: [[4, 6], [6, 7]], winner: "B", delta: 0 },
  { id: "m-104", date: isoIn(-3), time: "19:00", courtId: "indoor", type: "rated",
    teamA: ["ivan-petrov", "sergey-lebedev"], teamB: ["nikita-morozov", "vladislav-kim"],
    sets: [[6, 3], [6, 4]], winner: "A", delta: 14 },
  { id: "m-105", date: isoIn(-4), time: "20:30", courtId: "tent", type: "rated",
    teamA: ["georgiy-arakelyan", "darya-fedorova"], teamB: ["polina-mironova", "artem-belov"],
    sets: [[6, 2], [4, 6], [10, 6]], winner: "A", delta: 12 },
  { id: "m-106", date: isoIn(-5), time: "18:00", courtId: "open", type: "rated",
    teamA: ["elena-vasileva", "ivan-petrov"], teamB: ["andrey-sokolov", "kseniya-romanova"],
    sets: [[6, 4], [6, 4]], winner: "A", delta: 9 },
  { id: "m-107", date: isoIn(-6), time: "21:00", courtId: "indoor", type: "rated",
    teamA: ["egor-semenov", "ilya-novikov"], teamB: ["pavel-golubev", "denis-melnikov"],
    sets: [[6, 1], [6, 2]], winner: "A", delta: 7 },
  { id: "m-108", date: isoIn(-8), time: "19:30", courtId: "tent", type: "rated",
    teamA: ["ivan-petrov", "andrey-sokolov"], teamB: ["sergey-lebedev", "kirill-pavlov"],
    sets: [[2, 6], [7, 5], [10, 7]], winner: "A", delta: 16 },
  { id: "m-109", date: isoIn(-11), time: "20:00", courtId: "indoor", type: "rated",
    teamA: ["ivan-petrov", "roman-zaytsev"], teamB: ["timur-aliev", "darya-fedorova"],
    sets: [[3, 6], [4, 6]], winner: "B", delta: -12 },
  { id: "m-110", date: isoIn(-14), time: "18:30", courtId: "open", type: "rated",
    teamA: ["ivan-petrov", "vladislav-kim"], teamB: ["egor-semenov", "elena-vasileva"],
    sets: [[6, 3], [6, 2]], winner: "A", delta: 8 },
];

export const upcomingMatches = [
  { id: "u-201", date: isoIn(0), time: "19:00", courtId: "indoor", type: "rated", status: "live",
    teamA: ["maksim-orlov", "anna-smirnova"], teamB: ["georgiy-arakelyan", "mariya-kovaleva"],
    live: { sets: [[6, 4], [3, 2]], serving: "B" } },
  { id: "u-202", date: isoIn(0), time: "20:30", courtId: "tent", type: "rated", status: "upcoming",
    teamA: ["nikita-morozov", "polina-mironova"], teamB: ["dmitriy-volkov", "darya-fedorova"] },
  { id: "u-203", date: isoIn(1), time: "19:00", courtId: "indoor", type: "rated", status: "upcoming",
    teamA: ["ivan-petrov", "aleksey-kuznetsov"], teamB: ["timur-aliev", "artem-belov"] },
  { id: "u-204", date: isoIn(1), time: "21:00", courtId: "open", type: "friendly", status: "upcoming",
    teamA: ["alina-guseva", "egor-semenov"], teamB: ["viktoriya-titova", "ilya-novikov"] },
  { id: "u-205", date: isoIn(2), time: "18:00", courtId: "tent", type: "rated", status: "upcoming",
    teamA: ["elena-vasileva", "andrey-sokolov"], teamB: ["kseniya-romanova", "kirill-pavlov"] },
];

export const matchById = (id) => [...recentMatches, ...upcomingMatches].find((m) => m.id === id);
