// App state: one small context, persisted to localStorage. No backend — this is a demo.
import { html, createContext, useContext, useEffect, useMemo, useReducer, useCallback, useState } from "../lib/html.js";
import { load, save, clearAll } from "../lib/storage.js";
import { seedBookings } from "../data/bookings.js";
import { DEMO_USER_ID } from "../data/players.js";

const KEYS = ["user", "bookings", "joined", "createdGames", "registrations", "xpBonus", "settings"];

const initial = () => ({
  user: load("user", null),
  bookings: load("bookings", seedBookings),
  joined: load("joined", {}),
  createdGames: load("createdGames", []),
  registrations: load("registrations", {}),
  xpBonus: load("xpBonus", 0),
  settings: load("settings", { notifyGames: true, notifyTournaments: true, publicProfile: true, hand: "Правша", side: "Правая сторона" }),
});

const XP = { booking: 40, training: 80, game: 120, tournament: 300 };

function reducer(s, a) {
  switch (a.type) {
    case "login":
      return { ...s, user: { id: DEMO_USER_ID, phone: a.phone || "+7 900 061-61-61", since: Date.now() } };
    case "logout":
      return { ...s, user: null };
    case "addBooking":
      return { ...s, bookings: [a.booking, ...s.bookings], xpBonus: s.xpBonus + (a.booking.kind === "training" ? XP.training : XP.booking) };
    case "cancelBooking":
      return { ...s, bookings: s.bookings.map((b) => (b.id === a.id ? { ...b, status: "cancelled" } : b)) };
    case "joinGame":
      return { ...s, joined: { ...s.joined, [a.id]: true }, xpBonus: s.xpBonus + XP.game };
    case "leaveGame": {
      const joined = { ...s.joined };
      delete joined[a.id];
      return { ...s, joined, xpBonus: Math.max(0, s.xpBonus - XP.game) };
    }
    case "createGame":
      return { ...s, createdGames: [a.game, ...s.createdGames] };
    case "removeGame":
      return { ...s, createdGames: s.createdGames.filter((g) => g.id !== a.id) };
    case "register":
      return { ...s, registrations: { ...s.registrations, [a.id]: { partner: a.partner, at: Date.now() } }, xpBonus: s.xpBonus + XP.tournament };
    case "unregister": {
      const registrations = { ...s.registrations };
      delete registrations[a.id];
      return { ...s, registrations, xpBonus: Math.max(0, s.xpBonus - XP.tournament) };
    }
    case "settings":
      return { ...s, settings: { ...s.settings, ...a.patch } };
    case "reset":
      return { ...initial(), user: null, bookings: seedBookings, joined: {}, createdGames: [], registrations: {}, xpBonus: 0 };
    default:
      return s;
  }
}

const StoreCtx = createContext(null);
const ToastCtx = createContext(() => {});

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, initial);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    KEYS.forEach((k) => save(k, state[k]));
  }, [state]);

  const toast = useCallback((text, tone = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const api = useMemo(
    () => ({
      state,
      dispatch,
      login: (phone) => dispatch({ type: "login", phone }),
      logout: () => dispatch({ type: "logout" }),
      addBooking: (booking) => dispatch({ type: "addBooking", booking }),
      cancelBooking: (id) => dispatch({ type: "cancelBooking", id }),
      joinGame: (id) => dispatch({ type: "joinGame", id }),
      leaveGame: (id) => dispatch({ type: "leaveGame", id }),
      createGame: (game) => dispatch({ type: "createGame", game }),
      removeGame: (id) => dispatch({ type: "removeGame", id }),
      register: (id, partner) => dispatch({ type: "register", id, partner }),
      unregister: (id) => dispatch({ type: "unregister", id }),
      updateSettings: (patch) => dispatch({ type: "settings", patch }),
      resetDemo: () => {
        clearAll();
        dispatch({ type: "reset" });
      },
    }),
    [state]
  );

  return html`<${StoreCtx.Provider} value=${api}>
    <${ToastCtx.Provider} value=${toast}>
      ${children}
      <div class="toasts" role="status" aria-live="polite">
        ${toasts.map((t) => html`<div key=${t.id} class=${"toast toast--" + t.tone}><span class="toast__dot"></span>${t.text}</div>`)}
      </div>
    <//>
  <//>`;
}

export const useStore = () => useContext(StoreCtx);
export const useToast = () => useContext(ToastCtx);
export const XP_REWARD = XP;
