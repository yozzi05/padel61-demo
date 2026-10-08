import { html, cx, useState } from "../lib/html.js";
import { href } from "../lib/router.js";
import { useStore, useToast } from "../app/store.js";
import { tournamentById, STATUS_LABEL } from "../data/tournaments.js";
import { players, playerById, DEMO_USER_ID } from "../data/players.js";
import { courtById } from "../data/courts.js";
import { fromIso, fmtDay, weekdayShort, relDay } from "../lib/date.js";
import { rub, plural } from "../lib/format.js";
import { Button, Tabs, Empty, Modal, Avatar, LevelBadge } from "../components/ui.js";
import { Icon } from "../components/Icon.js";
import { teamsOf, teamById, teamLabel, GroupTable, Bracket, placeholderRounds, TeamRow, standings } from "../features/tournaments/index.js";

function RegisterModal({ t, open, onClose }) {
  const { register, login, state } = useStore();
  const toast = useToast();
  const taken = new Set(teamsOf(t, null).flatMap((x) => x.players));
  const me = playerById(DEMO_USER_ID);
  const pool = players.filter((p) => p.id !== DEMO_USER_ID && !taken.has(p.id) && (t.format !== "MIXED" || p.gender === "f")).slice(0, 8);
  const [partner, setPartner] = useState(pool[0] && pool[0].id);
  const submit = () => {
    if (!state.user) login();
    register(t.id, partner);
    toast(`Заявка на ${t.title} принята. +300 XP`);
    onClose();
  };
  return html`<${Modal} open=${open} onClose=${onClose} title=${"Участие · " + t.title}>
    <div class="reg">
      <div class="reg__me"><${Avatar} name=${me.name} size=${40} /><div><b>${me.name}</b><div class="t-xs muted">Уровень ${me.level} · ${me.rating}</div></div><span class="tag tag--ink">Вы</span></div>
      <div class="label muted">Выберите партнёра${t.format === "MIXED" ? " (микст)" : ""}</div>
      ${pool.length
        ? html`<div class="reg__list" role="radiogroup">
            ${pool.map(
              (p) => html`<button key=${p.id} role="radio" aria-checked=${partner === p.id} class=${cx("reg__p", partner === p.id && "is-on")} onClick=${() => setPartner(p.id)}>
                <${Avatar} name=${p.name} size=${32} /><span class="reg__n">${p.name}</span><${LevelBadge} level=${p.level} size="sm" /><span class="num">${p.rating}</span>
              </button>`
            )}
          </div>`
        : html`<${Empty} title="Нет свободных партнёров" text="Напишите управляющему — подберём пару." />`}
      <div class="reg__sum"><span class="t-sm muted">Взнос команды · оплата в клубе</span><span class="num">${rub(t.fee)}</span></div>
      <${Button} block size="lg" disabled=${!partner} onClick=${submit}>Подтвердить участие<//>
    </div>
  <//>`;
}

export function TournamentPage({ params, query }) {
  const { state, unregister } = useStore();
  const toast = useToast();
  const t = tournamentById(params.id);
  const [tab, setTab] = useState(query.tab || (t && t.status === "live" ? "bracket" : "info"));
  const [open, setOpen] = useState(false);
  if (!t) return html`<section class="ptitle wrap"><${Empty} title="Турнир не найден" action=${html`<${Button} to="/tournaments">Все турниры<//>`} /></section>`;

  const reg = state.registrations[t.id];
  const teams = teamsOf(t, reg);
  const left = t.capacity - teams.length;
  const d = fromIso(t.date);
  const allMatches = [...(t.groups || []).flatMap((g) => g.matches.map((m) => ({ ...m, stage: "Группа " + g.name }))), ...(t.bracket || []).flatMap((r) => r.matches.map((m) => ({ ...m, stage: r.name })))];

  const tabs = [
    { id: "info", label: "Информация" },
    { id: "teams", label: "Участники", count: teams.length },
    { id: "groups", label: "Группы" },
    { id: "bracket", label: "Сетка" },
    { id: "matches", label: "Матчи", count: allMatches.length || undefined },
    { id: "results", label: "Результаты" },
  ];

  const cta =
    t.status !== "open"
      ? null
      : reg
        ? html`<${Button} variant="ghost" icon="close" onClick=${() => { unregister(t.id); toast("Участие отменено", "error"); }}>Отменить участие<//>`
        : html`<${Button} size="lg" disabled=${left <= 0} onClick=${() => setOpen(true)}>${left > 0 ? "Участвовать" : "Мест нет"}<//>`;

  let body;
  if (tab === "info") {
    body = html`<div class="tinfo">
      <div class="tinfo__main">
        <p class="lead">${t.lead}</p>
        <ol class="tsteps">
          ${["Регистрация", "Жеребьёвка", t.groups ? "Групповой этап" : "1/4 финала", "Плей-офф", "Финал"].map((s, i) => {
            const stage = t.status === "open" ? 0 : t.status === "live" ? 3 : 5;
            return html`<li key=${s} class=${cx(i < stage && "is-done", i === stage && "is-now")}><span class="num">${String(i + 1).padStart(2, "0")}</span><span>${s}</span></li>`;
          })}
        </ol>
        <dl class="kv tinfo__kv">
          <dt>Схема</dt><dd>${t.scheme}</dd>
          <dt>Корты</dt><dd>${t.courts.map((c) => courtById(c).short).join(", ")}</dd>
          <dt>Старт</dt><dd>${fmtDay(d)}, ${t.time}</dd>
          <dt>Матчи</dt><dd>2 сета + супертай-брейк до 10</dd>
          <dt>Взнос</dt><dd>${rub(t.fee)}</dd>
        </dl>
      </div>
      <aside class="tinfo__side">
        <div class="label muted">Призы</div>
        <ul class="tprizes">${t.prizes.map((p, i) => html`<li key=${p}><span class="num">${i + 1}</span>${p}</li>`)}</ul>
        <p class="t-sm muted">Заполни форму, чтобы зарегистрироваться на турнир. Количество мест ограничено!</p>
      </aside>
    </div>`;
  } else if (tab === "teams") {
    body = html`<div class="tteams">${teams.map((tm, i) => html`<${TeamRow} key=${tm.id} team=${tm} i=${i} />`)}
      ${left > 0 && t.status === "open" ? html`<div class="tteams__free t-sm muted"><${Icon} name="plus" size=${16} /> Ещё ${left} ${plural(left, ["место", "места", "мест"])}</div>` : null}</div>`;
  } else if (tab === "groups") {
    body = t.groups
      ? html`<div class="tgroups">${t.groups.map((g) => html`<${GroupTable} key=${g.name} group=${g} teams=${teams} />`)}</div>`
      : t.status === "open"
        ? html`<${Empty} title="Жеребьёвка после закрытия регистрации" text=${`Группы появятся за день до старта — ${fmtDay(d)}.`} icon="users" />`
        : html`<${Empty} title="Без группового этапа" text="Этот турнир прошёл по олимпийской системе — смотрите сетку." icon="trophy" action=${html`<button class="btn btn--dark btn--sm" onClick=${() => setTab("bracket")}><span class="btn__label">Открыть сетку</span></button>`} />`;
  } else if (tab === "bracket") {
    body = html`${t.bracket ? null : html`<p class="t-sm muted tbr-note">Превью сетки. Пары появятся после жеребьёвки.</p>`}
      <div class="tbr-scroll"><${Bracket} rounds=${t.bracket || placeholderRounds(t.capacity)} teams=${teams} placeholder=${!t.bracket} /></div>`;
  } else if (tab === "matches") {
    body = allMatches.length
      ? html`<div class="tmatches">
          ${allMatches.map(
            (m) => html`<div key=${m.id} class=${cx("tm", "tm--" + m.status)}>
              <span class="label label-sm muted tm__stage">${m.stage}</span>
              <span class="tm__a">${teamLabel(teamById(teams, m.a))}</span>
              <span class="tm__score num">${m.sets.length ? m.sets.map((s) => s.join(":")).join(" ") : m.time || "—"}</span>
              <span class="tm__b">${teamLabel(teamById(teams, m.b))}</span>
              <span class="tm__st">${m.status === "live" ? html`<span class="live-tag">LIVE</span>` : m.status === "done" ? html`<span class="label label-sm muted">Сыгран</span>` : html`<span class="label label-sm">Скоро</span>`}</span>
            </div>`
          )}
        </div>`
      : html`<${Empty} title="Матчей пока нет" text="Расписание появится после жеребьёвки." icon="calendar" />`;
  } else {
    if (t.status === "finished") {
      const [qf, sf, f] = t.bracket;
      const fm = f.matches[0];
      const first = teamById(teams, fm.winner === "a" ? fm.a : fm.b);
      const second = teamById(teams, fm.winner === "a" ? fm.b : fm.a);
      const thirds = sf.matches.map((m) => teamById(teams, m.winner === "a" ? m.b : m.a));
      body = html`<div class="tres">
        ${[[first, "1", "Чемпионы"], [second, "2", "Финалисты"], ...thirds.map((x) => [x, "3–4", "Полуфинал"])].map(
          ([tm, place, l], i) => html`<div key=${i} class=${cx("tres__row", i === 0 && "is-first")} data-reveal style=${{ "--rd": i * 80 + "ms" }}>
            <span class="num tres__place">${place}</span>
            <span class="d-h3">${teamLabel(tm)}</span>
            <span class="t-sm muted">${tm.players.map((id) => playerById(id).name).join(" · ")}</span>
            <span class="label">${l}</span>
          </div>`
        )}
      </div>`;
    } else if (t.status === "live") {
      body = html`<div class="tres-live">
        <${Empty} title="Турнир идёт" text="Итоги появятся после финала. Сейчас — полуфиналы." icon="play" action=${html`<button class="btn btn--dark btn--sm" onClick=${() => setTab("bracket")}><span class="btn__label">Смотреть сетку</span></button>`} />
        <div class="tgroups">${t.groups.map((g) => html`<${GroupTable} key=${g.name} group=${g} teams=${teams} />`)}</div>
      </div>`;
    } else {
      body = html`<${Empty} title="Результатов пока нет" text=${`Турнир стартует ${fmtDay(d)} в ${t.time}.`} icon="trophy" />`;
    }
  }

  return html`
    <section class="th is-dark">
      <div class="th__img"><img src=${t.img} alt="" /></div>
      <div class="wrap th__in">
        <a class="ath__back t-sm" href=${href("/tournaments")}><${Icon} name="arrowLeft" size=${16} /> Все турниры</a>
        <div class="th__status">${t.status === "live" ? html`<span class="live-tag">LIVE</span>` : html`<span class=${cx("tag", t.status === "open" && "tag--lime")}>${STATUS_LABEL[t.status]}</span>`}</div>
        <h1 class="d-mega th__t" data-reveal="clip">${t.title}</h1>
        <div class="th__bar">
          <div><span class="label muted">Дата</span><span class="d-h4">${fmtDay(d)}, ${weekdayShort(d)}</span></div>
          <div><span class="label muted">Формат</span><span class="d-h4">${t.format}</span></div>
          <div><span class="label muted">Уровень</span><span class="d-h4">${t.level}</span></div>
          <div><span class="label muted">Команды</span><span class="d-h4">${teams.length} / ${t.capacity}</span></div>
          <div><span class="label muted">${t.status === "open" ? "Осталось" : "Статус"}</span><span class="d-h4 th__left">${t.status === "open" ? `${left} ${plural(left, ["место", "места", "мест"])}` : STATUS_LABEL[t.status]}</span></div>
          <div class="th__cta">${reg ? html`<span class="tag tag--lime th__in-tag"><${Icon} name="check" size=${14} /> Вы участвуете</span>` : null}${cta}</div>
        </div>
      </div>
    </section>

    <section class="wrap tpage">
      <${Tabs} items=${tabs} value=${tab} onChange=${setTab} />
      <div class="tpage__body" key=${tab}>${body}</div>
    </section>

    <${RegisterModal} t=${t} open=${open} onClose=${() => setOpen(false)} />
  `;
}
