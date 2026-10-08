import { html } from "../lib/html.js";

// Line icons drawn for this project: 24px grid, 1.6 stroke, square caps — matches court lines.
const P = {
  arrow: html`<path d="M4 12h15M13 6l6 6-6 6" />`,
  arrowUpRight: html`<path d="M7 17L17 7M9 7h8v8" />`,
  arrowLeft: html`<path d="M20 12H5M11 6l-6 6 6 6" />`,
  chevronDown: html`<path d="M6 9l6 6 6-6" />`,
  chevronRight: html`<path d="M9 6l6 6-6 6" />`,
  chevronLeft: html`<path d="M15 6l-6 6 6 6" />`,
  user: html`<circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />`,
  court: html`<rect x="4" y="3" width="16" height="18" /><path d="M4 12h16M12 6.5v11M4 6.5h16M4 17.5h16" />`,
  calendar: html`<rect x="3.5" y="5" width="17" height="15.5" /><path d="M3.5 10h17M8 3v4M16 3v4" />`,
  clock: html`<circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />`,
  ball: html`<circle cx="12" cy="12" r="8.5" /><path d="M5 6.5c3.5 2 3.5 9 0 11M19 6.5c-3.5 2-3.5 9 0 11" />`,
  racket: html`<ellipse cx="10" cy="9" rx="6" ry="6.5" /><path d="M14.2 13.6L20 20M8 7h.01M11 7h.01M9.5 10h.01M12.5 10h.01" />`,
  trophy: html`<path d="M7 4h10v5a5 5 0 01-10 0V4zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 21h8M9 18h6" />`,
  chart: html`<path d="M4 20V4M4 20h16M8 16l4-5 3 3 5-7" />`,
  users: html`<circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 4.5a3.5 3.5 0 010 7M18 15c2 .6 3 2.3 3.5 5" />`,
  plus: html`<path d="M12 5v14M5 12h14" />`,
  minus: html`<path d="M5 12h14" />`,
  check: html`<path d="M4.5 12.5l5 5 10-11" />`,
  close: html`<path d="M6 6l12 12M18 6L6 18" />`,
  lock: html`<rect x="5" y="10.5" width="14" height="10" /><path d="M8 10.5V7.5a4 4 0 018 0v3" />`,
  flame: html`<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.8 3.2-5.8 3.7-9.8 2.6 1.5 4 3.6 4.3 5.6.8-.6 1.4-1.6 1.6-2.8 1.9 1.8 3.4 4.3 3.4 7 0 3.6-2.6 6.2-6.5 6.2z" />`,
  phone: html`<path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 005.1 5.1l1.4-2.3L19 14.5V18a2 2 0 01-2 2A14 14 0 013 6a2 2 0 012-2z" />`,
  mail: html`<rect x="3" y="5.5" width="18" height="13" /><path d="M3 6.5l9 6.5 9-6.5" />`,
  pin: html`<path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0113 0C18.5 14.9 12 21 12 21z" /><circle cx="12" cy="9.8" r="2.3" />`,
  car: html`<path d="M4 16.5V12l2-5h12l2 5v4.5M4 16.5h16M4 16.5V19h3v-2.5M17 16.5V19h3v-2.5M4 12h16" /><circle cx="7.5" cy="14" r=".6" /><circle cx="16.5" cy="14" r=".6" />`,
  telegram: html`<path d="M21 4L3 11l6 2.5M21 4l-3 16-7-5.5M21 4L9 13.5v5.5l2.8-3.6" />`,
  instagram: html`<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><path d="M17 7h.01" />`,
  filter: html`<path d="M4 6h16M7 12h10M10 18h4" />`,
  menu: html`<path d="M4 7h16M4 12h16M4 17h10" />`,
  home: html`<path d="M4 10.5L12 4l8 6.5V20h-5.5v-6h-5v6H4z" />`,
  play: html`<circle cx="12" cy="12" r="8.5" /><path d="M10 8.5l5 3.5-5 3.5z" />`,
  ticket: html`<path d="M3 7.5h18V10a2 2 0 000 4v2.5H3V14a2 2 0 000-4V7.5zM14 7.5v9" />`,
  card: html`<rect x="3" y="5.5" width="18" height="13" /><path d="M3 9.5h18M6.5 15h4" />`,
  qr: html`<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2" />`,
  settings: html`<circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" />`,
  logout: html`<path d="M14 4H5v16h9M10 12h11M17 8l4 4-4 4" />`,
  search: html`<circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />`,
  bolt: html`<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z" />`,
  globe: html`<circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z" />`,
  gift: html`<rect x="3.5" y="8" width="17" height="4" /><path d="M5 12v8.5h14V12M12 8v12.5M12 8c-1.5-3.5-5-4-5-1.5S10 8 12 8zM12 8c1.5-3.5 5-4 5-1.5S14 8 12 8z" />`,
};

export function Icon({ name, size = 20, class: cls = "", title }) {
  return html`<svg
    class=${"icon " + cls}
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="square"
    stroke-linejoin="miter"
    aria-hidden=${title ? undefined : "true"}
    role=${title ? "img" : undefined}
  >
    ${title ? html`<title>${title}</title>` : null}${P[name] || null}
  </svg>`;
}
