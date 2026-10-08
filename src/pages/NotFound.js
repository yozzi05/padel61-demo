import { html } from "../lib/html.js";
import { Button } from "../components/ui.js";
import { CourtLines } from "../components/graphics.js";

export function NotFoundPage() {
  return html`<section class="nf is-dark">
    <${CourtLines} class="nf__court" />
    <div class="wrap nf__in">
      <span class="label">Out · Аут</span>
      <h1 class="d-mega">404</h1>
      <p class="lead">Мяч улетел за линию. Такой страницы нет.</p>
      <${Button} to="/">На главную<//>
    </div>
  </section>`;
}
