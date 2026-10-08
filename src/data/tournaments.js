// Tournaments. Formats and entry fees ("Мужчины PRO AM" — 15 000 ₽, "MIXED" — 12 000 ₽) are from padel61.ru;
// concrete events, teams and results are demo data.
import { isoIn } from "../lib/date.js";

/** "6:3 6:4" → finished; "live 6:4 2:3" → live; "" → scheduled */
const m = (id, a, b, score = "", extra = {}) => {
  const live = score.startsWith("live");
  const sets = score.replace("live", "").trim().split(/\s+/).filter(Boolean).map((s) => s.split(":").map(Number));
  let winner = null;
  if (!live && sets.length) {
    const wa = sets.filter(([x, y]) => x > y).length;
    winner = wa > sets.length - wa ? "a" : "b";
  }
  return { id, a, b, sets, winner, status: live ? "live" : sets.length ? "done" : "scheduled", ...extra };
};

const team = (id, p1, p2) => ({ id, players: [p1, p2] });

export const tournaments = [
  {
    id: "padel61-cup",
    title: "PADEL 61 CUP",
    format: "MIXED",
    level: "C+",
    date: isoIn(6),
    time: "10:00",
    status: "open",
    capacity: 12,
    fee: 12000,
    scheme: "3 группы по 4 → плей-офф",
    courts: ["open", "tent", "indoor"],
    img: "assets/photos/players-detail.jpg",
    lead: "Главный микст осени. Пары мужчина + женщина, уровень C+.",
    prizes: ["Кубок и медали", "Сертификаты клуба", "+300 XP каждому участнику"],
    teams: [
      team("c1", "kirill-pavlov", "kseniya-romanova"),
      team("c2", "roman-zaytsev", "alina-guseva"),
      team("c3", "egor-semenov", "viktoriya-titova"),
      team("c4", "ilya-novikov", "sofiya-karpova"),
      team("c5", "andrey-sokolov", "elena-vasileva"),
      team("c6", "pavel-golubev", "olga-nikitina"),
      team("c7", "denis-melnikov", "polina-mironova"),
      team("c8", "oleg-frolov", "darya-fedorova"),
    ],
  },
  {
    id: "pro-am",
    title: "PRO AM",
    format: "МУЖЧИНЫ",
    level: "B / A",
    date: isoIn(20),
    time: "11:00",
    status: "open",
    capacity: 12,
    fee: 15000,
    scheme: "Олимпийская система, до 12 пар",
    courts: ["indoor", "tent"],
    img: "assets/photos/player-smash.jpg",
    lead: "Мужской турнир высокого уровня. Сильнейшие пары клуба.",
    prizes: ["Призовой фонд клуба", "Рейтинг ×1.5", "+300 XP каждому участнику"],
    teams: [
      team("p1", "maksim-orlov", "georgiy-arakelyan"),
      team("p2", "timur-aliev", "dmitriy-volkov"),
      team("p3", "aleksey-kuznetsov", "artem-belov"),
      team("p4", "nikita-morozov", "sergey-lebedev"),
      team("p5", "vladislav-kim", "andrey-sokolov"),
      team("p6", "kirill-pavlov", "roman-zaytsev"),
      team("p7", "ilya-novikov", "egor-semenov"),
      team("p8", "pavel-golubev", "denis-melnikov"),
    ],
  },
  {
    id: "evening-league",
    title: "ВЕЧЕРНЯЯ ЛИГА",
    format: "MIXED",
    level: "C — B",
    date: isoIn(0),
    time: "18:00",
    status: "live",
    capacity: 8,
    fee: 12000,
    scheme: "2 группы по 4 → полуфиналы",
    courts: ["tent", "indoor"],
    img: "assets/photos/handshake.jpg",
    lead: "Турнир будних вечеров. Идёт прямо сейчас — следите за счётом.",
    prizes: ["Медали", "+300 XP каждому участнику"],
    teams: [
      team("l1", "roman-zaytsev", "alina-guseva"),
      team("l2", "egor-semenov", "viktoriya-titova"),
      team("l3", "kirill-pavlov", "kseniya-romanova"),
      team("l4", "pavel-golubev", "sofiya-karpova"),
      team("l5", "denis-melnikov", "olga-nikitina"),
      team("l6", "andrey-sokolov", "elena-vasileva"),
      team("l7", "oleg-frolov", "polina-mironova"),
      team("l8", "ilya-novikov", "darya-fedorova"),
    ],
    groups: [
      {
        name: "A",
        teams: ["l1", "l3", "l5", "l7"],
        matches: [
          m("la1", "l1", "l3", "6:4 6:3"),
          m("la2", "l5", "l7", "3:6 6:4 10:8"),
          m("la3", "l1", "l5", "6:2 6:1"),
          m("la4", "l3", "l7", "6:3 7:5"),
          m("la5", "l1", "l7", "4:6 6:3 10:6"),
          m("la6", "l3", "l5", "6:4 4:6 10:7"),
        ],
      },
      {
        name: "B",
        teams: ["l2", "l4", "l6", "l8"],
        matches: [
          m("lb1", "l2", "l4", "6:3 6:2"),
          m("lb2", "l6", "l8", "7:6 6:4"),
          m("lb3", "l2", "l6", "4:6 3:6"),
          m("lb4", "l4", "l8", "2:6 6:4 8:10"),
          m("lb5", "l2", "l8", "6:4 6:4"),
          m("lb6", "l4", "l6", "3:6 4:6"),
        ],
      },
    ],
    bracket: [
      {
        name: "Полуфинал",
        matches: [
          m("ls1", "l1", "l2", "live 6:4 3:3", { court: "indoor" }),
          m("ls2", "l6", "l3", "", { time: "20:00", court: "tent" }),
        ],
      },
      { name: "Финал", matches: [m("lf", null, null, "", { time: "21:00", court: "indoor" })] },
    ],
  },
  {
    id: "autumn-cup",
    title: "ОСЕННИЙ КУБОК",
    format: "MIXED",
    level: "B",
    date: isoIn(-12),
    time: "10:00",
    status: "finished",
    capacity: 8,
    fee: 12000,
    scheme: "Олимпийская система, 8 пар",
    courts: ["open", "tent", "indoor"],
    img: "assets/photos/rackets-balls.jpg",
    lead: "Восемь пар, три раунда, один кубок.",
    prizes: ["Кубок", "+300 XP каждому участнику"],
    teams: [
      team("a1", "maksim-orlov", "anna-smirnova"),
      team("a2", "georgiy-arakelyan", "mariya-kovaleva"),
      team("a3", "timur-aliev", "darya-fedorova"),
      team("a4", "dmitriy-volkov", "polina-mironova"),
      team("a5", "aleksey-kuznetsov", "elena-vasileva"),
      team("a6", "ivan-petrov", "kseniya-romanova"),
      team("a7", "artem-belov", "alina-guseva"),
      team("a8", "nikita-morozov", "viktoriya-titova"),
    ],
    groups: null,
    bracket: [
      {
        name: "1/4 финала",
        matches: [
          m("aq1", "a1", "a8", "6:2 6:3"),
          m("aq2", "a4", "a5", "4:6 6:4 10:7"),
          m("aq3", "a3", "a6", "6:4 3:6 8:10"),
          m("aq4", "a2", "a7", "6:3 6:4"),
        ],
      },
      {
        name: "Полуфинал",
        matches: [m("as1", "a1", "a4", "6:4 6:4"), m("as2", "a6", "a2", "3:6 2:6")],
      },
      { name: "Финал", matches: [m("af", "a1", "a2", "7:6 4:6 10:8")] },
    ],
  },
];

export const tournamentById = (id) => tournaments.find((t) => t.id === id);

export const STATUS_LABEL = {
  open: "Регистрация",
  live: "LIVE",
  finished: "Завершён",
};
