// Facts from padel61.ru — do not edit without checking the source site.
export const club = {
  name: "Падел 61",
  nameLatin: "PADEL 61",
  tagline: "Первый падел-клуб Ростова-на-Дону",
  intro: "Спорт, отдых и стиль жизни в одном месте. Корты для любого уровня — от первой игры до турниров.",
  city: "Ростов-на-Дону",
  address: "ул. Чемордачка, 105",
  addressFull: "г. Ростов-на-Дону, ул. Чемордачка, 105",
  coords: { lat: 47.2846, lon: 39.7366 }, // approximate, used for the stylised map only
  mapUrl: "https://yandex.ru/maps/?text=" + encodeURIComponent("Ростов-на-Дону, ул. Чемордачка, 105"),
  phone: "+7 (928) 608-61-61",
  phoneHref: "tel:+79286086161",
  email: "padel61@yandex.ru",
  hours: { open: "07:00", close: "22:00", label: "Ежедневно 07:00–22:00" },
  manager: { name: "Юлия Камалян", role: "Управляющая Падел 61" },
  socials: [
    { id: "telegram", label: "Telegram", handle: "padel61chat", url: "https://t.me/padel61chat" },
    { id: "instagram", label: "Instagram", handle: "padelrostov", url: "https://instagram.com/padelrostov" },
  ],
  legal: { inn: "616803211757", ogrnip: "324619600149348" },
};

export const services = [
  { id: "rackets", label: "Аренда ракеток", value: "от 500 ₽", unit: "игра" },
  { id: "balls", label: "Продажа мячей", value: "от 1 000 ₽", unit: "банка" },
  { id: "parking", label: "Парковка", value: "Бесплатно", unit: "" },
  { id: "certificate", label: "Подарочный сертификат", value: "от 10 000 ₽", unit: "" },
];

// "Преимущества" block of the source site, kept in its own wording.
export const clubLife = [
  { id: "courts", title: "Разнообразие кортов", sub: "для любого уровня игры", img: "assets/photos/club-court.jpg" },
  { id: "active", title: "Активный образ жизни", sub: "зона функционального тренинга", img: "assets/photos/club-gym.jpg" },
  { id: "lounge", title: "Атмосфера уюта и общения", sub: "лаунж у кортов", img: "assets/photos/club-lounge.jpg" },
  { id: "care", title: "Забота о себе", sub: "барбершоп на территории", img: "assets/photos/club-barber.jpg" },
  { id: "life", title: "Жизнь вне корта", sub: "вечеринки и события клуба", img: "assets/photos/club-party.jpg" },
];

export const certificate = {
  title: "Подарочный сертификат на падел",
  lead: "Подарите не вещь — подарите эмоцию, движение и стиль жизни.",
  points: [
    "подходит новичкам и опытным игрокам",
    "можно провести время с друзьями или близкими",
    "используется в удобное время",
  ],
  price: "от 10 000 ₽",
  img: "assets/photos/certificate.jpg",
};

export const LEVELS = ["D", "C", "C+", "B", "B+", "A"];
export const LEVEL_INFO = {
  D: "Начинающие",
  C: "Любители",
  "C+": "Любители",
  B: "Профессионалы",
  "B+": "Профессионалы",
  A: "Профессионалы",
};
