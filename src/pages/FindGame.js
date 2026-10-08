import { html, cx, useMemo, useState } from "../lib/html.js";
import { useStore, useToast } from "../app/store.js";
import { openGames, GAME_FORMATS, SEEKING } from "../data/openGames.js";
import { courts } from "../data/courts.js";
import { LEVELS } from "../data/club.js";
import { DEMO_USER_ID, playerById } from "../data/players.js";
import { iso, today, addDays, toMin, relDay } from "../lib/date.js";
import { plural } from "../lib/format.js";
import { Chips, Empty, Modal, Field, Button, Skeleton } from "../components/ui.js";
import { Icon } from "../components/Icon.js";
import { GameTicket, resolveGame } from "../features/matches/GameTicket.js";

const DAY_CHIPS = [
  { id: "all", label: "Все дни" },
  { id: iso(today()), label: "Сегодня" },
  { id: iso(addDays(today(), 1)), label: "Завтра" },
  { id: "week", label: "На неделе" },
];
const TIME_CHIPS = [
  { id: "all", label: "Любое" },
  { id: "morning", label: "Утро", from: 7, to: 12 },
  { id: "day", label: "День", from: 12, to: 17 },
  { id: "evening", label: "Вечер", from: 17, to: 22 },
];
const FORMAT_CHIPS = [{ id: "all", label: "Любой" }, ...GAME_FORMATS.map((f) => ({ id: f.id, label: f.label }))];
const SEEK_CHIPS = SEEKING.map((s) => ({ id: s.id, label: s.label }));

const lvlIdx = (l) => LEVELS.indexOf(l);

function CreateGame({ open, onClose, defaults }) {
  const { createGame, login, state } = useStore();
  const toast = useToast();
  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState("20:00");
  const [level, setLevel] = useState(defaults.level);
  const [format, setFormat] = useState("rated");
  const [seeking, setSeeking] = useState("any");
  const [courtId, setCourtId] = useState("tent");
  const [note, setNote] = useState("");
  const [err, setErr] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (date === iso(today()) && toMin(time) <= new Date().getHours() * 60 + new Date().getMinutes()) {
      setErr("Это время уже прошло — выберите позже.");
      return;
    }
    if (!state.user) login();
    const size = courtId === "single" ? 2 : 4;
    createGame({
      id: "g-my-" + Date.now().toString(36),
      host: DEMO_USER_ID,
      date, time, courtId, level, levelMax: LEVELS[Math.min(LEVELS.length - 1, lvlIdx(level) + 1)],
      format, seeking, size, players: [DEMO_USER_ID],
      note: note.trim() || "Заявка из демо-кабинета.",
    });
    toast(`Заявка создана: ${relDay(date).toLowerCase()}, ${time}`);
    onClose();
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(today(), i));
  const times = Array.from({ length: 30 }, (_, i) => `${String(7 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

  return html`<${Modal} open=${open} onClose=${onClose} title="Новая заявка">
    <form class="cg" onSubmit=${submit}>
      <div class="cg__row">
        <${Field} label="Дата">
          <select class="select" value=${date} onChange=${(e) => { setDate(e.target.value); setErr(null); }}>
            ${days.map((d) => html`<option key=${iso(d)} value=${iso(d)}>${relDay(iso(d))}</option>`)}
          </select>
        <//>
        <${Field} label="Время" error=${err}>
          <select class="select" value=${time} onChange=${(e) => { setTime(e.target.value); setErr(null); }}>
            ${times.map((t) => html`<option key=${t} value=${t}>${t}</option>`)}
          </select>
        <//>
      </div>
      <${Field} label="Мой уровень"><${Chips} items=${LEVELS.map((l) => ({ id: l, label: l }))} value=${level} onChange=${setLevel} /><//>
      <${Field} label="Формат"><${Chips} items=${GAME_FORMATS.map((f) => ({ id: f.id, label: f.label }))} value=${format} onChange=${setFormat} /><//>
      <${Field} label="Кого ищу"><${Chips} items=${SEEK_CHIPS} value=${seeking} onChange=${setSeeking} /><//>
      <${Field} label="Корт"><${Chips} items=${courts.map((c) => ({ id: c.id, label: `${c.no} · ${c.short}` }))} value=${courtId} onChange=${setCourtId} /><//>
      <${Field} label="Комментарий" hint="Необязательно">
        <input class="input" maxlength="80" placeholder="Например: играем на результат" value=${note} onInput=${(e) => setNote(e.target.value)} />
      <//>
      <${Button} type="submit" block size="lg">Опубликовать заявку<//>
    </form>
  <//>`;
}

export function FindGamePage() {
  const { state } = useStore();
  const me = playerById(DEMO_USER_ID);
  const [day, setDay] = useState("all");
  const [time, setTime] = useState("all");
  const [level, setLevel] = useState("all");
  const [format, setFormat] = useState("all");
  const [seek, setSeek] = useState("any");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Short skeleton on filter change — feels like a live search
  const apply = (fn) => (v) => {
    fn(v);
    setLoading(true);
    setTimeout(() => setLoading(false), 280);
  };

  const all = [...state.createdGames, ...openGames];
  const list = useMemo(() => {
    const t = TIME_CHIPS.find((x) => x.id === time);
    const weekEnd = iso(addDays(today(), 7));
    return all.filter((g) => {
      if (day === "week" ? g.date > weekEnd : day !== "all" && g.date !== day) return false;
      if (t && t.from != null) {
        const h = parseInt(g.time, 10);
        if (h < t.from || h >= t.to) return false;
      }
      if (level !== "all") {
        const i = lvlIdx(level);
        if (i < lvlIdx(g.level) || i > lvlIdx(g.levelMax || g.level)) return false;
      }
      if (format !== "all" && g.format !== format) return false;
      if (seek !== "any" && g.seeking !== seek && g.seeking !== "any") return false;
      return true;
    });
  }, [day, time, level, format, seek, all.length]);

  const seats = list.reduce((s, g) => s + Math.max(0, resolveGame(g, state).left), 0);
  const joinedCount = Object.keys(state.joined).length;

  return html`
    <section class="fg-hero is-dark">
      <div class="wrap fg-hero__in">
        <div>
          <div class="label fg-hero__k">Match · Find a game</div>
          <h1 class="fg-hero__h"><span class="d-mega" data-reveal="clip">Найти</span><span class="d-mega fg-hero__2" data-reveal="clip" style="--rd:120ms">игру</span></h1>
        </div>
        <div class="fg-hero__side">
          <div class="fg-hero__stat"><span class="num">${list.length}</span><span class="label muted">${plural(list.length, ["заявка", "заявки", "заявок"])}</span></div>
          <div class="fg-hero__stat"><span class="num">${seats}</span><span class="label muted">${plural(seats, ["свободное место", "свободных места", "свободных мест"])}</span></div>
          <div class="fg-hero__stat"><span class="num fg-hero__me">${joinedCount}</span><span class="label muted">вы в составе</span></div>
          <${Button} onClick=${() => setOpen(true)} icon="plus">Создать заявку<//>
        </div>
      </div>
    </section>

    <section class="wrap fg">
      <aside class="fg__filters" aria-label="Фильтры">
        <div class="fg__f"><span class="label muted">Дата</span><${Chips} items=${DAY_CHIPS} value=${day} onChange=${apply(setDay)} /></div>
        <div class="fg__f"><span class="label muted">Время</span><${Chips} items=${TIME_CHIPS} value=${time} onChange=${apply(setTime)} /></div>
        <div class="fg__f">
          <span class="label muted">Мой уровень</span>
          <${Chips} items=${[{ id: "all", label: "Любой" }, ...LEVELS.map((l) => ({ id: l, label: l }))]} value=${level} onChange=${apply(setLevel)} />
          ${level === "all" ? html`<button class="t-xs fg__mine" onClick=${() => apply(setLevel)(me.level)}>Мой уровень: ${me.level}</button>` : null}
        </div>
        <div class="fg__f"><span class="label muted">Кого ищу</span><${Chips} items=${SEEK_CHIPS} value=${seek} onChange=${apply(setSeek)} /></div>
        <div class="fg__f"><span class="label muted">Формат</span><${Chips} items=${FORMAT_CHIPS} value=${format} onChange=${apply(setFormat)} /></div>
      </aside>

      <div class="fg__list">
        ${loading
          ? html`<${Skeleton} rows=${3} h=${120} />`
          : list.length
            ? list.map((g, i) => html`<div key=${g.id} data-reveal style=${{ "--rd": i * 50 + "ms" }}><${GameTicket} game=${g} /></div>`)
            : html`<${Empty}
                title="Подходящих игр нет"
                text="Создайте свою заявку — игроки вашего уровня увидят её в ленте."
                icon="ball"
                action=${html`<${Button} variant="dark" icon="plus" onClick=${() => setOpen(true)}>Создать заявку<//>`}
              />`}
      </div>
    </section>

    <${CreateGame}
      open=${open}
      onClose=${() => setOpen(false)}
      defaults=${{ date: day !== "all" && day !== "week" ? day : iso(today()), level: level !== "all" ? level : me.level }}
    />
  `;
}
