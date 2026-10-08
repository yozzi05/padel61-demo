import { html, cx, useMemo, useState } from "../lib/html.js";
import { href } from "../lib/router.js";
import { useStore } from "../app/store.js";
import { players, DEMO_USER_ID } from "../data/players.js";
import { LEVELS } from "../data/club.js";
import { int, plural } from "../lib/format.js";
import { Avatar, LevelBadge, Chips, Empty, Form, CountUp } from "../components/ui.js";
import { Spark, CourtLines } from "../components/graphics.js";
import { Icon } from "../components/Icon.js";
import { Streak } from "../features/gamification/index.js";

const GENDER = [
  { id: "all", label: "Все" },
  { id: "m", label: "Мужчины" },
  { id: "f", label: "Женщины" },
];
const LEVEL_CHIPS = [{ id: "all", label: "Все уровни" }, ...LEVELS.map((l) => ({ id: l, label: l }))];
const MAX = players[0].rating;
const MIN = players[players.length - 1].rating;

function Move({ p }) {
  const d = p.prevRank - p.rank;
  if (!d) return html`<span class="mv mv--flat" aria-label="Без изменений">—</span>`;
  return html`<span class=${cx("mv", d > 0 ? "mv--up" : "mv--down")} aria-label=${d > 0 ? `Вверх на ${d}` : `Вниз на ${-d}`}>${d > 0 ? "▲" : "▼"}${Math.abs(d)}</span>`;
}

function Podium({ top }) {
  const order = [top[1], top[0], top[2]];
  return html`<div class="podium">
    ${order.map((p, i) => {
      const place = p.rank;
      return html`<a key=${p.id} href=${href("/players/" + p.id)} class=${cx("pod", "pod--" + place)} data-reveal style=${{ "--rd": [150, 0, 300][i] + "ms" }}>
        <span class="pod__place num">${place}</span>
        <${Avatar} name=${p.name} size=${place === 1 ? 88 : 68} />
        <span class="pod__name d-h4">${p.name}</span>
        <span class="pod__meta"><${LevelBadge} level=${p.level} size="sm" /><span class="t-xs muted">${p.winRate}% WR · ${p.matches} матчей</span></span>
        <span class="pod__rating num"><${CountUp} value=${p.rating} /></span>
        <span class="pod__block" aria-hidden="true"><span class="label label-sm">${["2nd", "1st", "3rd"][i]}</span></span>
      </a>`;
    })}
  </div>`;
}

export function PlayersPage() {
  const { state } = useStore();
  const [gender, setGender] = useState("all");
  const [level, setLevel] = useState("all");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      players.filter(
        (p) =>
          (gender === "all" || p.gender === gender) &&
          (level === "all" || p.level === level) &&
          (!q || p.name.toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [gender, level, q]
  );
  const filtered = gender !== "all" || level !== "all" || q;
  const me = players.find((p) => p.id === DEMO_USER_ID);

  const jumpToMe = () => {
    setGender("all");
    setLevel("all");
    setQ("");
    setTimeout(() => {
      const el = document.getElementById("row-" + DEMO_USER_ID);
      el && el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  return html`
    <section class="rk-hero is-dark">
      <${CourtLines} class="rk-hero__court" />
      <div class="wrap rk-hero__in">
        <div class="rk-hero__title">
          <div class="label rk-hero__k">Rank · Season 2026</div>
          <h1 class="rk-hero__h">
            <span class="d-mega" data-reveal="clip">Рейтинг</span>
            <span class="d-mega rk-hero__61" data-reveal="clip" style="--rd:120ms">Padel 61</span>
          </h1>
          <p class="t-sm muted rk-hero__note">Рейтинг — сила игры, меняется после каждого рейтингового матча. XP — активность в клубе. Это разные числа.</p>
        </div>
        <${Podium} top=${players.slice(0, 3)} />
      </div>
    </section>

    <section class="wrap lb">
      <div class="lb__bar">
        <${Chips} items=${GENDER} value=${gender} onChange=${setGender} />
        <${Chips} items=${LEVEL_CHIPS} value=${level} onChange=${setLevel} class="lb__lv" />
        <label class="lb__search">
          <${Icon} name="search" size=${18} />
          <input class="input" type="search" placeholder="Найти игрока" value=${q} onInput=${(e) => setQ(e.target.value)} aria-label="Поиск игрока" />
        </label>
      </div>

      <div class="lb__info t-sm muted">
        <span>${list.length} ${plural(list.length, ["игрок", "игрока", "игроков"])}${filtered ? " по фильтру" : ""}</span>
        ${state.user ? html`<button class="alink" onClick=${jumpToMe}>Моя позиция · #${me.rank}</button>` : null}
      </div>

      ${list.length
        ? html`<div class="lb__table" role="table" aria-label="Рейтинг игроков">
            <div class="lbr lbr--head label label-sm" role="row">
              <span role="columnheader">#</span><span role="columnheader">Игрок</span><span role="columnheader">Lvl</span>
              <span role="columnheader">Rating</span><span role="columnheader" class="lbr__c-m">Матчи</span><span role="columnheader" class="lbr__c-wl">W — L</span>
              <span role="columnheader" class="lbr__c-wr">WR</span><span role="columnheader" class="lbr__c-form">Форма</span><span role="columnheader" class="lbr__c-xp">XP</span>
            </div>
            ${list.map(
              (p, i) => html`<a key=${p.id} id=${"row-" + p.id} role="row" href=${href("/players/" + p.id)} class=${cx("lbr", p.id === DEMO_USER_ID && "is-me", p.rank <= 3 && "is-top")} data-reveal style=${{ "--rd": Math.min(i, 10) * 30 + "ms" }}>
                <span class="lbr__rank" role="cell"><span class="num">${p.rank}</span><${Move} p=${p} /></span>
                <span class="lbr__player" role="cell">
                  <${Avatar} name=${p.name} size=${40} />
                  <span class="lbr__name">
                    <span class="lbr__n">${p.name}${p.id === DEMO_USER_ID ? html`<span class="tag tag--lime lbr__you">Вы</span>` : null}</span>
                    <span class="t-xs muted lbr__sub"><${Streak} streak=${p.streak} /> · ${p.wins}–${p.losses}</span>
                  </span>
                </span>
                <span role="cell"><${LevelBadge} level=${p.level} /></span>
                <span class="lbr__rating" role="cell">
                  <span class="num">${p.rating}</span>
                  <span class="lbr__bar"><span style=${{ transform: `scaleX(${(p.rating - MIN + 60) / (MAX - MIN + 60)})` }}></span></span>
                </span>
                <span class="lbr__c-m num" role="cell">${p.matches}</span>
                <span class="lbr__c-wl t-sm" role="cell"><b>${p.wins}</b> — ${p.losses}</span>
                <span class="lbr__c-wr num" role="cell">${p.winRate}<small>%</small></span>
                <span class="lbr__c-form" role="cell"><${Form} form=${p.form} /><${Spark} data=${p.history.slice(-8)} w=${56} h=${20} /></span>
                <span class="lbr__c-xp t-sm" role="cell">${int(p.xp)}<small> XP</small></span>
              </a>`
            )}
          </div>`
        : html`<${Empty} title="Никого не нашли" text="Попробуйте другой уровень или сбросьте фильтры." icon="search"
            action=${html`<button class="btn btn--dark btn--sm" onClick=${() => { setGender("all"); setLevel("all"); setQ(""); }}><span class="btn__label">Сбросить фильтры</span></button>`} />`}
    </section>
  `;
}
