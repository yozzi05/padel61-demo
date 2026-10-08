import { html, render } from "./lib/html.js";
import { App } from "./app/App.js";

render(html`<${App} />`, document.getElementById("app"));
