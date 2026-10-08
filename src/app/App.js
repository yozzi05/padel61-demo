import { html, useEffect, useLayoutEffect } from "../lib/html.js";
import { useLocation, match } from "../lib/router.js";
import { useRevealAll } from "../hooks/index.js";
import { StoreProvider } from "./store.js";
import { Header, BottomNav, Footer } from "../components/layout.js";

import { HomePage } from "../pages/Home.js";
import { BookingPage } from "../pages/Booking.js";
import { CourtsPage } from "../pages/Courts.js";
import { TrainingPage } from "../pages/Training.js";
import { CoachesPage } from "../pages/Coaches.js";
import { CoachPage } from "../pages/Coach.js";
import { PlayersPage } from "../pages/Players.js";
import { PlayerPage } from "../pages/Player.js";
import { MatchesPage } from "../pages/Matches.js";
import { FindGamePage } from "../pages/FindGame.js";
import { TournamentsPage } from "../pages/Tournaments.js";
import { TournamentPage } from "../pages/Tournament.js";
import { ProfilePage } from "../pages/Profile.js";
import { ContactsPage } from "../pages/Contacts.js";
import { NotFoundPage } from "../pages/NotFound.js";

const ROUTES = [
  ["/", HomePage, "Падел 61 — первый падел-клуб Ростова-на-Дону"],
  ["/booking", BookingPage, "Бронирование корта"],
  ["/courts", CourtsPage, "Корты"],
  ["/training", TrainingPage, "Тренировки"],
  ["/coaches", CoachesPage, "Тренеры"],
  ["/coaches/:id", CoachPage, "Тренер"],
  ["/players", PlayersPage, "Рейтинг игроков"],
  ["/players/:id", PlayerPage, "Игрок"],
  ["/matches", MatchesPage, "Матчи"],
  ["/find-game", FindGamePage, "Найти игру"],
  ["/tournaments", TournamentsPage, "Турниры"],
  ["/tournaments/:id", TournamentPage, "Турнир"],
  ["/profile", ProfilePage, "Личный кабинет"],
  ["/contacts", ContactsPage, "Контакты"],
];

function resolve(path) {
  for (const [pattern, Page, title] of ROUTES) {
    const params = match(pattern, path);
    if (params) return { Page, params, title };
  }
  return { Page: NotFoundPage, params: {}, title: "Не найдено" };
}

function Shell() {
  const { path, query } = useLocation();
  const { Page, params, title } = resolve(path);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [path]);
  useEffect(() => {
    document.title = path === "/" ? title : `${title} · Падел 61`;
  }, [path, title]);
  useRevealAll(path);

  return html`
    <a class="skip" href="#main">К содержимому</a>
    <${Header} path=${path} />
    <main id="main" class="page-enter" key=${path}>
      <${Page} params=${params} query=${query} path=${path} />
    </main>
    <${Footer} />
    <${BottomNav} path=${path} />
  `;
}

export function App() {
  return html`<${StoreProvider}><${Shell} /><//>`;
}
