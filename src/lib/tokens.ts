// Reads a raw value out of the vendored design tokens at build time, for
// the few places CSS custom properties cannot reach (e.g. the theme-color
// meta tag). Keeps tokens.css the single source: no colour literal is
// repeated in this repo.
import tokensCss from '../styles/vendor/tokens.css?raw';

export function tokenValue(name: string): string {
  const match = tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`tokens.css has no --${name}`);
  return match[1].trim();
}
