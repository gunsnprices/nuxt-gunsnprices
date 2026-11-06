# nuxt-gunsnprices

[![npm](https://img.shields.io/npm/v/nuxt-gunsnprices)](https://www.npmjs.com/package/nuxt-gunsnprices)
[![Tests](https://github.com/gunsnprices/nuxt-gunsnprices/actions/workflows/ci.yml/badge.svg)](https://github.com/gunsnprices/nuxt-gunsnprices/actions/workflows/ci.yml)

Nuxt components and composables for gun shop, ammo and shooting sites. Give them a product listing title and they
render clean specs: brand, model, caliber, magazine capacity, barrel length, rounds per box and cost per round.

```vue
<template>
  <GnpProductSpecs title='Glock 19 Gen 5 MOS 9mm 4.02" 15rd Pistol' />

  <GnpCaliberBadge value="5.56 NATO" />          <!-- 5.56×45mm NATO -->
  <GnpCostPerRound :price="18.99" :rounds="50" /> <!-- $0.38/rd -->
</template>
```

The work is done by the [`gunsnprices`](https://www.npmjs.com/package/gunsnprices) title parser, the one behind the
price comparison site [GunsNPrices](https://gunsnprices.com). No network calls, no API key, and the parser stays out
of your client bundle (see [How it renders](#how-it-renders)).

## Install

```bash
npx nuxi module add nuxt-gunsnprices
```

or

```bash
npm install nuxt-gunsnprices
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-gunsnprices'],
})
```

Works with Nuxt 3 and 4. Components and composables are auto-imported.

## Components

### `<GnpProductSpecs>`

Reads a listing title and renders a `<dl>` with the fields it finds. Rows that can't be read are skipped, and if
nothing is found the component renders nothing.

```vue
<GnpProductSpecs title="Federal American Eagle 9mm Luger 115gr FMJ 50 Rounds" :price="18.99" />
```

renders

```html
<dl class="gnp-specs" data-kind="ammo">
  <div class="gnp-specs__row"><dt>Caliber</dt><dd>9×19mm Parabellum</dd></div>
  <div class="gnp-specs__row"><dt>Rounds per box</dt><dd>50</dd></div>
  <div class="gnp-specs__row"><dt>Cost per round</dt><dd>$0.38</dd></div>
</dl>
```

| Prop | Type | Default | |
|---|---|---|---|
| `title` | `string` | required | Product title as the store wrote it |
| `brand` | `string` | | Manufacturer, if you know it |
| `mpn` | `string` | | Part number (Glock part numbers are decoded) |
| `price` | `number` | | For ammo, adds a cost-per-round row |
| `kind` | `'firearm' \| 'ammo'` | auto | Skip the firearm/ammo guess |
| `link` | `boolean` | `false` | Link the caliber to its price comparison page on GunsNPrices |
| `currency` | `string` | `'$'` | |

### `<GnpCaliberBadge>`

Normalizes a caliber written any way (`9mm Luger`, `9x19`, `.223 Rem`, `5.56 NATO`, `12ga`, `300 BLK`) to one name
from a list of 293 calibers, and renders it as a small pill.

```vue
<GnpCaliberBadge value=".300 BLK" show-type />               <!-- .300 AAC Blackout (rifle) -->
<GnpCaliberBadge text="PMC Bronze 5.56 NATO 55gr FMJ" link /> <!-- first caliber found in the text, linked -->
```

| Prop | Type | Default | |
|---|---|---|---|
| `value` | `string` | | A caliber; shown as is (class `gnp-caliber--unknown`) if it isn't recognized |
| `text` | `string` | | Any text; the first caliber found is used |
| `showType` | `boolean` | `false` | Show handgun / rifle / rimfire / shotgun |
| `link` | `boolean` | `false` | Link to the caliber's price comparison page on GunsNPrices |

### `<GnpCostPerRound>`

```vue
<GnpCostPerRound :price="289.99" title="Winchester 9mm 115gr FMJ 1000 Round Case" format="cents" /> <!-- 29.0¢/rd -->
<GnpCostPerRound :price="24.99">n/a</GnpCostPerRound>  <!-- slot is shown when rounds are unknown -->
```

| Prop | Type | Default | |
|---|---|---|---|
| `price` | `number` | required | Price of the box or case |
| `rounds` | `number` | | Rounds in it |
| `title` | `string` | | Or the title: rounds are read from `50 Rounds`, `1000rd case`, `20/box` ... |
| `format` | `'dollars' \| 'cents'` | `'dollars'` | `$0.38/rd` or `38.0¢/rd` |
| `decimals` | `number` | 2 / 1 | |
| `currency` | `string` | `'$'` | |
| `suffix` | `string` | `'/rd'` | |

`class` and other attributes go on the root element, as usual in Vue.

## Composables

Each takes plain values, refs or getters and returns a computed ref.

```vue
<script setup lang="ts">
const caliber = useCaliber('.300 BLK')
// caliber.value → { id: '300aacblackout', name: '.300 AAC Blackout', type: 'rifle', url: 'https://gunsnprices.com/...' }

const cpr = useCostPerRound(289.99, 'Winchester 9mm 115gr FMJ 1000 Round Case')
// cpr.value → 0.29   (the second argument can also be a round count: useCostPerRound(18.99, 50) → 0.3798)

const specs = useProductSpecs('Ruger 10/22 Carbine .22 LR 18.5" 10rd', { link: false })
// specs.value.info.model.model → 'Ruger 10/22 Carbine'
// specs.value.rows → [{ label: 'Brand', value: 'Ruger' }, { label: 'Model', ... }, ...]  (6 rows)
</script>
```

| Composable | Returns |
|---|---|
| `useCaliber(value)` | `Caliber \| null`. A caliber, or any text containing one |
| `useCostPerRound(price, roundsOrTitle)` | `number \| null`, dollars per round, 4 decimals |
| `useProductSpecs(title, { brand, mpn, price, kind, link, currency })` | `{ info, rows } \| null`. `info` is the parser's full result |

See the [`gunsnprices` README](https://github.com/gunsnprices/gunsnprices-js#readme) for every field of `info`.
Types are exported from the module: `import type { Caliber, ProductInfo, SpecRow } from 'nuxt-gunsnprices'`.

## Options

```ts
export default defineNuxtConfig({
  modules: ['nuxt-gunsnprices'],
  gunsnprices: {
    prefix: 'Gnp',          // <GnpProductSpecs>, <GnpCaliberBadge>, <GnpCostPerRound>
    components: true,       // false, or pick: { CostPerRound: false }
    composables: true,      // auto-import useCaliber, useCostPerRound, useProductSpecs
    link: false,            // default for the components' link prop
    css: true,              // add the small stylesheet
  },
})
```

## How it renders

The parser carries about 450 kB of model and caliber data (around 80 kB gzipped), so the module keeps it on the
server. During server rendering or `nuxt generate` the components and composables are computed there, and the
results travel to the browser in the Nuxt payload, so the page hydrates without loading the parser.

When a page renders something the server didn't see (a client-side navigation to a page that wasn't prerendered
with the same input, or an app with `ssr: false`), the parser is loaded on demand as a separate chunk, and the
component fills in once it arrives. A cost per round with a known round count never needs the parser.

## Styling

The stylesheet uses a few CSS variables you can override:

```css
:root {
  --gnp-border: #d0d7de;
  --gnp-label-bg: #f6f8fa;
  --gnp-radius: 4px;
}
```

Class names: `gnp-specs`, `gnp-specs__row`, `gnp-caliber`, `gnp-caliber__type`, `gnp-cpr`. Each element also carries
data attributes (`data-kind`, `data-caliber`, `data-type`, `data-cpr`, `data-rounds`) for your own styling or scripts.
Set `css: false` to style everything yourself.

## Development

```bash
npm install
npm run dev:prepare   # stub build + types
npm run dev           # playground
npm test              # unit, server-rendered (e2e) and client-side tests
```

## See also

[`astro-gunsnprices`](https://www.npmjs.com/package/astro-gunsnprices) and
[`hexo-gunsnprices`](https://www.npmjs.com/package/hexo-gunsnprices) do the same for Astro and Hexo.

## License

MIT. The model and caliber data come from the `gunsnprices` package (CC BY 4.0, attribution: GunsNPrices).
