# Changelog

## 0.1.0 (2026-11-06)

- First release: `<GnpProductSpecs>`, `<GnpCaliberBadge>` and `<GnpCostPerRound>` components.
- Auto-imported composables `useCaliber`, `useCostPerRound` and `useProductSpecs`.
- Module options: component `prefix`, `components` on/off (all or one by one), `composables`, `link` default, `css`.
- The parser runs on the server; results reach the browser in the payload, and the parser loads on demand only for
  client-side renders.
