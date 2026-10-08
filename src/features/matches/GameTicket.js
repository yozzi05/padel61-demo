// Open game request — styled as a match ticket with seat map.
import { html, cx } from "../../lib/html.js";
import { href } from "../../lib/router.js";
import { relDay } from "../../lib/date.js";
import { plural, shortName, firstName } from "../../lib/format.js";
import { courtById } from "../../data/courts.js";
import { playerById, DEMO_USER_ID } from "../../data/players.js";
import { GAME_FORMATS, SEEKING } from "../../data/openGames.js";
import { useStore, useToast } from "../../app/store.js";
import { Avatar, LevelBadge } from "../../components/ui.js";
import { Icon } from "../../components/Icon.js";

/** Merge mock request with the user's join state. */
export function resolveGame(g, state) {
  const joined = !!state.joined[g.id];
  const mine = g.host === DEMO_USER_ID;
  const players = joined && !g.players.includes(DEMO_USER_ID) ? [...g.players, DEMO_USER_ID] : g.players;
  return { ...g, players, joined, mine, left: g.size - players.length };
}

export function GameTicket({ game, compact }) {
  const { state, joinGame, leaveGame, removeGame, login } = useStore();
  const toast = useToast();
  const g = resolveGame(game, state);
  const host = playerById(g.host);
  const court = courtById(g.courtId);
  const fmt = GAME_FORMATS.find((f) => f.id === g.format);
  const seek = SEEKING.find((s) => s.id === g.seeking);
  const full = g.left <= 0;

  const onJoin = () => {
    if (!state.user) login();
    joinGame(g.id);
    toast(`Вы в игре: ${relDay(g.date).toLowerCase()}, ${g.time}. +120 XP`);
  };
  const onLeave = () => {
    leaveGame(g.id);
    toast("Вы покинули игру", "error");
  };

  return html`<article class=${cx("ticket", compact && "ticket--compact", g.joined && "is-joined", full && !g.joined && "is-full")}>
    <div class="ticket__when">
      <span class="label">${relDay(g.date)}</span>
      <span class="num ticket__time">${g.time}</span>
      <span class="t-xs muted">Корт ${court.no} · ${court.short}</span>
    </div>
    <div class="ticket__body">
      <div class="ticket__host">
        <${Avatar} name=${host.name} size=${28} />
        <span class="t-sm"><b>${g.mine ? "Вы" : firstName(host.name)}</b> ${g.mine ? "ищете" : "ищет"} ${g.size === 2 ? "соперника" : "игроков"}</span>
      </div>
      <div class="ticket__tags">
        <span class="ticket__lvl"><${LevelBadge} level=${g.level} size="sm" />${g.levelMax && g.levelMax !== g.level ? html`<span class="muted">—</span><${LevelBadge} level=${g.levelMax} size="sm" />` : null}</span>
        <span class="tag">${fmt.label}</span>
        ${seek.id !== "any" ? html`<span class="tag">${seek.label}</span>` : null}
      </div>
      ${!compact && g.note ? html`<p class="ticket__note t-sm muted">${g.note}</p>` : null}
    </div>
    <div class="ticket__seats">
      <div class=${"seats seats--" + g.size} aria-label=${`Мест: ${g.size}, занято: ${g.players.length}`}>
        ${Array.from({ length: g.size }, (_, i) => {
          const pid = g.players[i];
          const p = pid && playerById(pid);
          return html`<span key=${i} class=${cx("seat", p && "seat--taken", pid === DEMO_USER_ID && "seat--me")} title=${p ? p.name : "Свободно"}>
            ${p ? html`<a href=${href("/players/" + p.id)} tabindex="-1"><${Avatar} name=${p.name} size=${30} /></a>` : html`<${Icon} name="plus" size=${14} />`}
          </span>`;
        })}
      </div>
      <div class="ticket__need">
        ${full
          ? html`<span class="label">Состав собран</span>`
          : html`<span class="label">Нужно ещё</span><span class="num ticket__need-n">${g.left}</span><span class="t-xs muted">${plural(g.left, ["игрок", "игрока", "игроков"])}</span>`}
      </div>
    </div>
    <div class="ticket__act">
      ${g.mine
        ? html`<button class="btn btn--ghost btn--sm" onClick=${() => { removeGame(g.id); toast("Заявка удалена", "error"); }}><span class="btn__label">Удалить заявку</span></button>`
        : g.joined
          ? html`<button class="btn btn--ghost btn--sm" onClick=${onLeave}><span class="btn__label">Вы в игре · Выйти</span></button>`
          : html`<button class="btn btn--primary btn--sm" disabled=${full} onClick=${onJoin}><span class="btn__label">${full ? "Мест нет" : "Присоединиться"}</span>${full ? null : html`<span class="btn__icon"><${Icon} name="arrow" size=${16} /></span>`}</button>`}
    </div>
    ${g.joined ? html`<span class="ticket__stamp label">IN</span>` : null}
  </article>`;
}

export const joinedPlayers = (g) => g.players.map((id) => shortName(playerById(id).name));
