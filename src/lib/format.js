export const rub = (n) => `${Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ")} ₽`;
export const int = (n) => Math.round(n).toLocaleString("ru-RU");

/** Russian plural: plural(5, ["игрок", "игрока", "игроков"]) */
export function plural(n, [one, few, many]) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

export const initials = (name) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export const firstName = (name) => name.split(" ")[0];
export const lastName = (name) => name.split(" ").slice(1).join(" ");
export const shortName = (name) => {
  const [f, l] = name.split(" ");
  return l ? `${f} ${l[0]}.` : f;
};
