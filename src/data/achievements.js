// Achievements. `mark` is the large glyph on the badge — numbers, not cartoons.
// Progress below is for the demo account (Иван Петров).
export const achievements = [
  { id: "first-win", mark: "1", unit: "WIN", title: "Первая победа", desc: "Выиграть первый рейтинговый матч", tier: "bronze", xp: 100 },
  { id: "streak-5", mark: "5", unit: "STREAK", title: "5 побед подряд", desc: "Серия из пяти побед без поражений", tier: "silver", xp: 300 },
  { id: "matches-10", mark: "10", unit: "MATCHES", title: "10 матчей", desc: "Сыграть 10 матчей в клубе", tier: "bronze", xp: 150 },
  { id: "matches-50", mark: "50", unit: "MATCHES", title: "50 матчей", desc: "Сыграть 50 матчей в клубе", tier: "silver", xp: 400 },
  { id: "matches-100", mark: "100", unit: "MATCHES", title: "100 матчей", desc: "Сыграть 100 матчей в клубе", tier: "gold", xp: 1000 },
  { id: "giant-killer", mark: "↑", unit: "UPSET", title: "Победа над сильнейшим", desc: "Победить пару с рейтингом выше на 100+", tier: "silver", xp: 250 },
  { id: "tournament-win", mark: "★", unit: "CUP", title: "Победа в турнире", desc: "Выиграть любой турнир клуба", tier: "gold", xp: 800 },
  { id: "partners-10", mark: "10", unit: "PARTNERS", title: "10 разных партнёров", desc: "Сыграть в паре с десятью разными игроками", tier: "bronze", xp: 200 },
  { id: "top-10", mark: "10", unit: "TOP", title: "Топ-10 клуба", desc: "Войти в десятку рейтинга Padel 61", tier: "gold", xp: 600 },
  { id: "number-one", mark: "№1", unit: "PADEL 61", title: "№1 Padel 61", desc: "Возглавить рейтинг клуба", tier: "platinum", xp: 2000 },
];

export const demoProgress = {
  "first-win": { done: true, date: "2025-04-19" },
  "streak-5": { done: false, value: 4, target: 5 },
  "matches-10": { done: true, date: "2025-06-02" },
  "matches-50": { done: false, value: 38, target: 50 },
  "matches-100": { done: false, value: 38, target: 100 },
  "giant-killer": { done: true, date: "2026-09-24" },
  "tournament-win": { done: false, value: 0, target: 1 },
  "partners-10": { done: true, date: "2026-03-11" },
  "top-10": { done: false, value: 14, target: 10, inverse: true },
  "number-one": { done: false, value: 14, target: 1, inverse: true },
};

export const TIER_LABEL = { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum" };

/** XP sources — shown in profile so XP feels earned, not random. */
export const XP_RULES = [
  { label: "Матч", xp: 120 },
  { label: "Победа", xp: 60 },
  { label: "Бронирование корта", xp: 40 },
  { label: "Тренировка", xp: 80 },
  { label: "Турнир", xp: 300 },
];
