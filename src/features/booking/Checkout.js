// Demo checkout: no payment provider. Plans 100% / 50% + 50% in club. Success → booking saved to localStorage.
import { html, cx, useState } from "../../lib/html.js";
import { rub } from "../../lib/format.js";
import { rng } from "../../lib/random.js";
import { href } from "../../lib/router.js";
import { useStore } from "../../app/store.js";
import { playerById } from "../../data/players.js";
import { Button, Field } from "../../components/ui.js";
import { Icon } from "../../components/Icon.js";
import { CourtLines } from "../../components/graphics.js";

// Decorative QR: three finder squares + pseudo-random modules
const QR_NOISE = rng("padel61-sbp");
const QR_BITS = Array.from({ length: 81 }, () => QR_NOISE() > 0.52);
function qrCell(i) {
  const x = i % 9;
  const y = Math.floor(i / 9);
  const finder = (fx, fy) => x >= fx && x < fx + 3 && y >= fy && y < fy + 3;
  if (finder(0, 0) || finder(6, 0) || finder(0, 6)) return true;
  return QR_BITS[i];
}

const METHODS = [
  { id: "card", label: "Карта", sub: "•••• 4242 · демо", icon: "card" },
  { id: "sbp", label: "СБП", sub: "по QR-коду", icon: "qr" },
];

/**
 * order: { kicker, title, lines: [[label, value]], total }
 * onConfirm(payment) → returns the saved booking (sync)
 */
export function Checkout({ order, onBack, onConfirm }) {
  const { state, login } = useStore();
  const me = playerById("ivan-petrov");
  const [plan, setPlan] = useState("full");
  const [method, setMethod] = useState("card");
  const [fail, setFail] = useState(false);
  const [phase, setPhase] = useState("form"); // form | processing | error | success
  const [result, setResult] = useState(null);
  const [agree, setAgree] = useState(true);

  const now = plan === "full" ? order.total : Math.round(order.total / 2);
  const later = order.total - now;

  const pay = () => {
    setPhase("processing");
    setTimeout(() => {
      if (fail) {
        setPhase("error");
        return;
      }
      if (!state.user) login();
      const saved = onConfirm({ plan, method, paid: now });
      setResult(saved);
      setPhase("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1700);
  };

  if (phase === "success") return html`<${Success} order=${order} booking=${result} paidNow=${now} later=${later} />`;

  return html`<div class="co">
    <div class="co__main">
      <button class="co__back t-sm" onClick=${onBack}><${Icon} name="arrowLeft" size=${16} /> Изменить выбор</button>
      <h2 class="d-h2">Оплата</h2>

      <section class="co__block">
        <div class="label muted">Сколько оплатить сейчас</div>
        <div class="co__plans" role="radiogroup">
          <button role="radio" aria-checked=${plan === "full"} class=${cx("plan", plan === "full" && "is-on")} onClick=${() => setPlan("full")}>
            <span class="plan__pct num">100%</span>
            <span class="plan__t">Сразу всё</span>
            <span class="t-sm muted">${rub(order.total)} сейчас</span>
          </button>
          <button role="radio" aria-checked=${plan === "half"} class=${cx("plan", plan === "half" && "is-on")} onClick=${() => setPlan("half")}>
            <span class="plan__pct num">50<small>/50</small></span>
            <span class="plan__t">Половина сейчас</span>
            <span class="t-sm muted">${rub(Math.round(order.total / 2))} сейчас · остаток в клубе</span>
          </button>
        </div>
      </section>

      <section class="co__block">
        <div class="label muted">Способ оплаты</div>
        <div class="seg co__methods" role="radiogroup">
          ${METHODS.map(
            (m) => html`<button key=${m.id} role="radio" aria-checked=${method === m.id} class=${cx("seg__btn", method === m.id && "is-on")} onClick=${() => setMethod(m.id)}>
              <span class="co__m"><${Icon} name=${m.icon} size=${18} /> ${m.label}</span><small>${m.sub}</small>
            </button>`
          )}
        </div>
        ${method === "card"
          ? html`<div class="co__card" aria-label="Демо-карта">
              <span class="label">Padel 61 · Demo card</span>
              <span class="num co__card-n">•••• •••• •••• 4242</span>
              <span class="co__card-row t-xs"><span>${me.name.toUpperCase()}</span><span>12 / 29</span></span>
            </div>`
          : html`<div class="co__qr">
              <div class="co__qr-img" aria-hidden="true">${Array.from({ length: 81 }, (_, i) => html`<i key=${i} class=${qrCell(i) ? "on" : ""}></i>`)}</div>
              <p class="t-sm muted">Отсканируйте QR в приложении банка. В демо оплата подтвердится автоматически.</p>
            </div>`}
      </section>

      <section class="co__block co__contact">
        <${Field} label="Игрок"><input class="input" value=${me.name} readonly /><//>
        <${Field} label="Телефон" hint="Пришлём подтверждение в SMS (демо)"><input class="input" value=${(state.user && state.user.phone) || "+7 900 061-61-61"} readonly /><//>
      </section>

      <label class="co__check t-sm">
        <input type="checkbox" checked=${agree} onChange=${(e) => setAgree(e.target.checked)} />
        <span>Принимаю правила клуба. Отмена без штрафа — за 24 часа.</span>
      </label>
      <label class="co__check co__check--demo t-xs muted">
        <input type="checkbox" checked=${fail} onChange=${(e) => setFail(e.target.checked)} />
        <span>Демо: имитировать отказ банка</span>
      </label>

      ${phase === "error"
        ? html`<div class="co__error" role="alert">
            <${Icon} name="close" size=${18} />
            <div><b>Платёж отклонён банком.</b><br /><span class="t-sm">Деньги не списаны. Попробуйте ещё раз или выберите СБП.</span></div>
          </div>`
        : null}
    </div>

    <aside class="co__side">
      <div class="oticket is-dark">
        <div class="oticket__top">
          <span class="label">${order.kicker}</span>
          <span class="d-h3">${order.title}</span>
        </div>
        <dl class="kv oticket__kv">
          ${order.lines.map(([k, v]) => html`<dt key=${k + "k"}>${k}</dt><dd key=${k + "v"}>${v}</dd>`)}
        </dl>
        <div class="oticket__sum">
          <div class="oticket__row"><span class="muted t-sm">Итого</span><span class="num">${rub(order.total)}</span></div>
          ${plan === "half" ? html`<div class="oticket__row"><span class="muted t-sm">В клубе</span><span class="t-sm">${rub(later)}</span></div>` : null}
          <div class="oticket__row oticket__row--now"><span class="label">К оплате сейчас</span><span class="num oticket__now">${rub(now)}</span></div>
        </div>
        <${Button} block size="lg" onClick=${pay} loading=${phase === "processing"} disabled=${!agree} icon="arrow">
          ${phase === "processing" ? "Проводим платёж…" : phase === "error" ? `Повторить · ${rub(now)}` : `Оплатить ${rub(now)}`}
        <//>
        <p class="t-xs muted oticket__note"><${Icon} name="lock" size=${14} /> Демо-оплата. Реальные деньги не списываются.</p>
      </div>
    </aside>
  </div>`;
}

function Success({ order, booking, paidNow, later }) {
  const code = "P61-" + (booking ? booking.id.slice(-4).toUpperCase() : "0000");
  return html`<div class="ok is-dark">
    <${CourtLines} class="ok__court" />
    <div class="ok__check" aria-hidden="true">
      <svg viewBox="0 0 52 52"><path d="M13 27l9 9 18-20" pathLength="1" /></svg>
    </div>
    <span class="label ok__k">Оплачено · ${rub(paidNow)}</span>
    <h2 class="d-h1 ok__t">Бронь<br />подтверждена</h2>
    <div class="ok__grid">
      <div><span class="label muted">Код брони</span><span class="num ok__code">${code}</span></div>
      ${order.lines.slice(0, 3).map(([k, v]) => html`<div key=${k}><span class="label muted">${k}</span><span class="d-h4">${v}</span></div>`)}
    </div>
    ${later > 0 ? html`<p class="t-sm ok__later">Остаток ${rub(later)} — оплатите на ресепшене клуба.</p>` : null}
    <div class="ok__xp"><span class="num">+${booking && booking.kind === "training" ? 80 : 40} XP</span><span class="t-sm muted">начислено в профиль</span></div>
    <div class="ok__ctas">
      <a class="btn btn--primary btn--lg" href=${href("/profile?tab=bookings")}><span class="btn__label">Мои бронирования</span><span class="btn__icon"><${Icon} name="arrow" size=${18} /></span></a>
      <a class="btn btn--ghost btn--lg" href=${href("/find-game")}><span class="btn__label">Найти партнёров</span><span class="btn__icon"><${Icon} name="users" size=${18} /></span></a>
    </div>
  </div>`;
}
