// "Найти игру" — open requests from club players (mock).
// size: total seats (4 for doubles, 2 for single); players: already confirmed.
import { isoIn } from "../lib/date.js";

export const GAME_FORMATS = [
  { id: "rated", label: "Рейтинговая", hint: "влияет на рейтинг" },
  { id: "friendly", label: "Товарищеская", hint: "без рейтинга" },
  { id: "americano", label: "Американо", hint: "ротация пар" },
];

export const SEEKING = [
  { id: "any", label: "Любые" },
  { id: "men", label: "Мужчины" },
  { id: "women", label: "Женщины" },
  { id: "mixed", label: "Микст" },
];

export const openGames = [
  { id: "g-1", host: "kirill-pavlov", date: isoIn(0), time: "20:00", courtId: "tent", level: "C+", levelMax: "B",
    format: "rated", seeking: "any", size: 4, players: ["kirill-pavlov", "kseniya-romanova"],
    note: "Нужна вторая пара. Играем на результат." },
  { id: "g-2", host: "alina-guseva", date: isoIn(0), time: "21:00", courtId: "open", level: "C", levelMax: "C+",
    format: "friendly", seeking: "women", size: 4, players: ["alina-guseva", "viktoriya-titova", "sofiya-karpova"],
    note: "Женская игра, спокойный темп." },
  { id: "g-3", host: "sergey-lebedev", date: isoIn(1), time: "07:30", courtId: "indoor", level: "B", levelMax: "B+",
    format: "rated", seeking: "men", size: 4, players: ["sergey-lebedev"],
    note: "Утренняя игра до работы. Ищу троих." },
  { id: "g-4", host: "egor-semenov", date: isoIn(1), time: "19:30", courtId: "tent", level: "C+", levelMax: "B",
    format: "americano", seeking: "mixed", size: 4, players: ["egor-semenov", "elena-vasileva"],
    note: "Американо, меняемся партнёрами каждые 20 минут." },
  { id: "g-5", host: "pavel-golubev", date: isoIn(2), time: "18:00", courtId: "single", level: "C", levelMax: "C+",
    format: "friendly", seeking: "any", size: 2, players: ["pavel-golubev"],
    note: "Single корт, отработка ударов 1 на 1." },
  { id: "g-6", host: "darya-fedorova", date: isoIn(2), time: "20:30", courtId: "indoor", level: "B+", levelMax: "A",
    format: "rated", seeking: "mixed", size: 4, players: ["darya-fedorova", "artem-belov", "polina-mironova"],
    note: "Сильный микст. Нужен один игрок B+ и выше." },
  { id: "g-7", host: "olga-nikitina", date: isoIn(3), time: "11:00", courtId: "open", level: "D", levelMax: "C",
    format: "friendly", seeking: "any", size: 4, players: ["olga-nikitina", "oleg-frolov"],
    note: "Только начинаем — присоединяйтесь, будет весело." },
  { id: "g-8", host: "andrey-sokolov", date: isoIn(4), time: "19:00", courtId: "tent", level: "B", levelMax: "B+",
    format: "rated", seeking: "any", size: 4, players: ["andrey-sokolov", "roman-zaytsev", "ilya-novikov"],
    note: "Последнее место. Кто первый — тот играет." },
];
