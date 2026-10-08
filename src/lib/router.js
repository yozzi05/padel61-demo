// Tiny hash router — works on any static host (GitHub Pages, artifact, file share).
// URLs look like  #/players/ivan-petrov?tab=matches
import { html, useEffect, useState } from "./html.js";

function parse() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs = ""] = raw.split("?");
  return { path: path || "/", query: Object.fromEntries(new URLSearchParams(qs)) };
}

export function navigate(to, { replace = false } = {}) {
  const next = "#" + to;
  if (replace) history.replaceState(null, "", next);
  else if (location.hash !== next) location.hash = next;
  if (replace) window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function useLocation() {
  const [loc, setLoc] = useState(parse);
  useEffect(() => {
    const on = () => setLoc(parse());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return loc;
}

/** Match "/players/:id" against "/players/ivan-petrov" → { id: "ivan-petrov" } */
export function match(pattern, path) {
  const p = pattern.split("/").filter(Boolean);
  const s = path.split("/").filter(Boolean);
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export const href = (to) => "#" + to;

export function Link({ to, children, class: cls, className, ...rest }) {
  return html`<a href=${href(to)} class=${cls || className} ...${rest}>${children}</a>`;
}

/** true when current path is `to` or nested under it */
export const isActive = (path, to) => (to === "/" ? path === "/" : path === to || path.startsWith(to + "/"));
