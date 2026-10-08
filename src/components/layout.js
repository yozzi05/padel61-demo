// Global chrome: header, mobile menu, bottom navigation, footer.
import { html, cx, useEffect, useState } from "../lib/html.js";
import { Link, href, isActive } from "../lib/router.js";
import { useScrolled } from "../hooks/index.js";
import { useStore } from "../app/store.js";
import { Icon } from "./Icon.js";
import { Avatar } from "./ui.js";
import { Logo } from "./graphics.js";
import { club } from "../data/club.js";
import { playerById } from "../data/players.js";

export const NAV = [
  { to: "/courts", label: "Корты" },
  { to: "/booking", label: "Бронирование" },
  { to: "/training", label: "Тренировки" },
  { to: "/coaches", label: "Тренеры" },
  { to: "/players", label: "Игроки" },
  { to: "/tournaments", label: "Турниры" },
  { to: "/contacts", label: "Контакты" },
];

const MORE = [
  { to: "/find-game", label: "Найти игру" },
  { to: "/matches", label: "Матчи" },
];

export function Header({ path }) {
  const scrolled = useScrolled(12);
  const [open, setOpen] = useState(false);
  const { state } = useStore();
  const me = state.user ? playerById(state.user.id) : null;
  const overHero = path === "/" && !scrolled;

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
  }, [open]);

  return html`<header class=${cx("hdr", scrolled && "hdr--scrolled", overHero && "hdr--over")}>
    <div class="hdr__in">
      <${Link} to="/" class="hdr__logo" aria-label="Padel 61 — на главную"><${Logo} compact /><//>
      <span class="hdr__demo label label-sm" title="Неофициальный демо-концепт платформы. Бронирования и оплата не настоящие.">Demo</span>
      <nav class="hdr__nav" aria-label="Основная навигация">
        ${NAV.map(
          (n) => html`<a key=${n.to} href=${href(n.to)} class=${cx("hdr__link", isActive(path, n.to) && "is-active")} aria-current=${isActive(path, n.to) ? "page" : undefined}>${n.label}</a>`
        )}
      </nav>
      <div class="hdr__right">
        <a class="btn btn--primary btn--sm hdr__cta" href=${href("/booking")}><span class="btn__label">Забронировать</span></a>
        <a class=${cx("hdr__profile", isActive(path, "/profile") && "is-active")} href=${href("/profile")} aria-label=${me ? "Профиль: " + me.name : "Войти"}>
          ${me ? html`<${Avatar} name=${me.name} size=${34} />` : html`<${Icon} name="user" size=${20} />`}
        </a>
        <button class="hdr__burger" aria-label=${open ? "Закрыть меню" : "Открыть меню"} aria-expanded=${open} onClick=${() => setOpen(!open)}>
          <${Icon} name=${open ? "close" : "menu"} size=${22} />
        </button>
      </div>
    </div>
    <div class=${cx("mmenu is-dark", open && "is-open")} aria-hidden=${!open}>
      <nav class="mmenu__nav">
        ${[...NAV, ...MORE].map(
          (n, i) => html`<a key=${n.to} href=${href(n.to)} class="mmenu__link" style=${{ "--i": i }} tabindex=${open ? 0 : -1}>
            <span class="mmenu__idx label">${String(i + 1).padStart(2, "0")}</span>
            <span class="d-h3">${n.label}</span>
          </a>`
        )}
      </nav>
      <div class="mmenu__foot t-sm">
        <a href=${club.phoneHref}>${club.phone}</a>
        <span class="muted">${club.hours.label}</span>
      </div>
    </div>
  </header>`;
}

const TABS = [
  { to: "/", label: "Главная", icon: "home" },
  { to: "/find-game", label: "Играть", icon: "ball" },
  { to: "/booking", label: "Бронь", icon: "court", main: true },
  { to: "/players", label: "Рейтинг", icon: "chart" },
  { to: "/profile", label: "Профиль", icon: "user" },
];

export function BottomNav({ path }) {
  return html`<nav class="bnav" aria-label="Мобильная навигация">
    ${TABS.map(
      (t) => html`<a key=${t.to} href=${href(t.to)} class=${cx("bnav__item", t.main && "bnav__item--main", isActive(path, t.to) && "is-active")} aria-current=${isActive(path, t.to) ? "page" : undefined}>
        <span class="bnav__icon"><${Icon} name=${t.icon} size=${22} /></span>
        <span class="bnav__label">${t.label}</span>
      </a>`
    )}
  </nav>`;
}

export function Footer() {
  return html`<footer class="ftr is-dark">
    <div class="ftr__top wrap">
      <div class="ftr__cta">
        <div class="label muted">Чемордачка, 105 · ${club.hours.label}</div>
        <a class="d-h2 ftr__big" href=${href("/booking")}>Выбирай корт.<br />Собирай команду.<br /><span class="ftr__accent">Играй.</span></a>
      </div>
      <div class="ftr__cols">
        <div>
          <div class="label muted ftr__h">Играть</div>
          <a href=${href("/booking")}>Бронирование</a>
          <a href=${href("/find-game")}>Найти игру</a>
          <a href=${href("/training")}>Тренировки</a>
          <a href=${href("/tournaments")}>Турниры</a>
        </div>
        <div>
          <div class="label muted ftr__h">Клуб</div>
          <a href=${href("/courts")}>Корты</a>
          <a href=${href("/coaches")}>Тренеры</a>
          <a href=${href("/players")}>Рейтинг</a>
          <a href=${href("/matches")}>Матчи</a>
        </div>
        <div>
          <div class="label muted ftr__h">Связь</div>
          <a href=${club.phoneHref}>${club.phone}</a>
          <a href=${"mailto:" + club.email}>${club.email}</a>
          ${club.socials.map((s) => html`<a key=${s.id} href=${s.url} target="_blank" rel="noopener">${s.label} · ${s.handle}</a>`)}
        </div>
      </div>
    </div>
    <div class="ftr__mark" aria-hidden="true">PADEL<span>61</span></div>
    <div class="ftr__bottom wrap t-xs muted">
      <span>© Падел 61, ${new Date().getFullYear()} · ИНН ${club.legal.inn} · ОГРНИП ${club.legal.ogrnip}</span>
      <span>Демо-версия платформы. Рейтинг, матчи и расписание — демонстрационные данные.</span>
    </div>
  </footer>`;
}
