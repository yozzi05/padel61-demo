// Court types and prices — padel61.ru ("Аренда корта").
// One court per type is a demo assumption: the source site lists types, not the count.
export const OPEN_MIN = 7 * 60;
export const CLOSE_MIN = 22 * 60;
export const SLOT = 30;

export const courts = [
  {
    id: "open",
    no: "01",
    name: "Открытый корт",
    short: "Открытый",
    en: "OPEN AIR",
    price: 3000,
    format: "2 × 2",
    size: "20 × 10 м",
    hours: "07:00–22:00",
    roof: "Без крыши",
    img: "assets/photos/club-court.jpg",
    imgPos: "50% 60%",
    lead: "Небо над головой, стекло вокруг. Классический падел на свежем воздухе.",
    traits: ["Под открытым небом", "Стеклянные стенки", "Вечернее освещение"],
  },
  {
    id: "tent",
    no: "02",
    name: "Шатер",
    short: "Шатер",
    en: "TENT",
    price: 3000,
    format: "2 × 2",
    size: "20 × 10 м",
    hours: "07:00–22:00",
    roof: "Шатер",
    img: "assets/photos/player-woman.jpg",
    imgPos: "50% 40%",
    lead: "Крыша над кортом и воздух вокруг. Игра не зависит от дождя и солнца.",
    traits: ["Защита от дождя и солнца", "Естественный свет", "Сезон без пауз"],
  },
  {
    id: "indoor",
    no: "03",
    name: "Закрытый корт",
    short: "Закрытый",
    en: "INDOOR",
    price: 3000,
    format: "2 × 2",
    size: "20 × 10 м",
    hours: "07:00–22:00",
    roof: "Закрытый",
    img: "assets/photos/player-volley.jpg",
    imgPos: "50% 35%",
    lead: "Круглый год при любой погоде. Ровный свет, без ветра — чистая игра.",
    traits: ["Круглый год", "Без ветра", "Ровный свет"],
  },
  {
    id: "single",
    no: "04",
    name: "Single корт",
    short: "Single",
    en: "SINGLE",
    price: 1000,
    format: "1 × 1",
    size: "20 × 6 м",
    hours: "07:00–22:00",
    roof: "—",
    img: "assets/photos/player-serve.jpg",
    imgPos: "50% 50%",
    lead: "Корт один на один. Для тренировок, отработки ударов и дуэлей.",
    traits: ["Игра 1 на 1", "Идеален для тренировок", "Самая доступная цена"],
  },
];

export const courtById = (id) => courts.find((c) => c.id === id);
