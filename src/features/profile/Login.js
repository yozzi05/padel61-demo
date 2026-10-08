// Demo login: phone → SMS code. No backend; any 4 digits work, the code is prefilled.
import { html, cx, useState, useRef, useEffect } from "../../lib/html.js";
import { useStore, useToast } from "../../app/store.js";
import { playerById, DEMO_USER_ID } from "../../data/players.js";
import { Button, Field, Avatar, LevelBadge } from "../../components/ui.js";
import { CourtLines } from "../../components/graphics.js";
import { Icon } from "../../components/Icon.js";

const DEMO_PHONE = "+7 900 061-61-61";

export function Login() {
  const { login } = useStore();
  const toast = useToast();
  const me = playerById(DEMO_USER_ID);
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState(DEMO_PHONE);
  const [code, setCode] = useState(["", "", "", ""]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (step === "code") refs[0].current && refs[0].current.focus();
  }, [step]);

  const sendCode = (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 11) {
      setErr("Введите номер полностью: +7 и 10 цифр");
      return;
    }
    setErr(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("code");
    }, 700);
  };

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    setErr(null);
    if (d && i < 3) refs[i + 1].current.focus();
  };

  const verify = (e) => {
    e && e.preventDefault();
    if (code.join("").length < 4) {
      setErr("Введите 4 цифры из SMS");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(phone);
      toast(`Добро пожаловать, ${me.name.split(" ")[0]}!`);
    }, 600);
  };

  return html`<section class="login">
    <div class="login__art is-dark">
      <${CourtLines} class="login__court" vertical />
      <div class="login__art-in">
        <span class="label login__k">Player account · Demo</span>
        <h1 class="d-mega login__h"><span>Личный</span><span class="login__h2">кабинет</span></h1>
        <p class="t-sm muted">Бронирования, рейтинг, XP, достижения и турниры — в одном профиле.</p>
        <div class="login__card">
          <${Avatar} name=${me.name} size=${56} />
          <div><b>${me.name}</b><div class="t-xs muted">Демо-аккаунт · рейтинг ${me.rating} · #${me.rank}</div></div>
          <${LevelBadge} level=${me.level} />
        </div>
      </div>
    </div>

    <div class="login__form">
      ${step === "phone"
        ? html`<form onSubmit=${sendCode} class="login__f" novalidate>
            <span class="label muted">Шаг 1 из 2</span>
            <h2 class="d-h2">Вход</h2>
            <${Field} label="Телефон" error=${err} hint="Демо: номер уже заполнен">
              <input class="input" type="tel" inputmode="tel" autocomplete="tel" value=${phone} onInput=${(e) => { setPhone(e.target.value); setErr(null); }} />
            <//>
            <${Button} type="submit" block size="lg" loading=${loading}>Получить код<//>
            <div class="login__or t-xs muted"><span>или</span></div>
            <${Button} variant="ghost" block icon="bolt" onClick=${() => { login(DEMO_PHONE); toast("Вы вошли в демо-аккаунт"); }}>Войти как демо-игрок<//>
          </form>`
        : html`<form onSubmit=${verify} class="login__f">
            <button type="button" class="co__back t-sm" onClick=${() => { setStep("phone"); setCode(["", "", "", ""]); }}><${Icon} name="arrowLeft" size=${16} /> ${phone}</button>
            <span class="label muted">Шаг 2 из 2</span>
            <h2 class="d-h2">Код из SMS</h2>
            <div class=${cx("otp", err && "has-error")}>
              ${code.map(
                (d, i) => html`<input
                  key=${i}
                  ref=${refs[i]}
                  class="otp__cell num"
                  inputmode="numeric"
                  maxlength="1"
                  aria-label=${`Цифра ${i + 1}`}
                  value=${d}
                  onInput=${(e) => setDigit(i, e.target.value)}
                  onKeyDown=${(e) => e.key === "Backspace" && !code[i] && i > 0 && refs[i - 1].current.focus()}
                />`
              )}
            </div>
            ${err ? html`<span class="field__error t-xs">${err}</span>` : html`<span class="t-xs muted">Демо: подойдут любые 4 цифры. <button type="button" class="login__fill" onClick=${() => setCode(["6", "1", "6", "1"])}>Подставить 6161</button></span>`}
            <${Button} type="submit" block size="lg" loading=${loading}>Войти<//>
          </form>`}
    </div>
  </section>`;
}
