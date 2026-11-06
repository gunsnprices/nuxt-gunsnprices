import type { Caliber, ProductInfo } from 'gunsnprices'

export type Parser = typeof import('gunsnprices')

export interface SpecRow {
  label: string
  value: string
  /** Set only when `link` is on: the GunsNPrices price comparison page for the caliber */
  href?: string
}

export interface ProductSpecs {
  info: ProductInfo
  rows: SpecRow[]
}

export interface ProductSpecsOptions {
  /** Manufacturer, if you know it */
  brand?: string
  /** Manufacturer part number, if you know it (decodes Glock part numbers) */
  mpn?: string
  /** Listing price; for ammo it adds a cost-per-round row */
  price?: number | string
  /** Skip the firearm/ammo guess */
  kind?: 'firearm' | 'ammo'
  /** Link the caliber to its GunsNPrices price comparison page (off by default) */
  link?: boolean
  /** Currency symbol for cost per round */
  currency?: string
}

export interface CostPerRoundFormat {
  /** 'dollars' → $0.38/rd, 'cents' → 38.0¢/rd */
  format?: 'dollars' | 'cents'
  /** Decimal places (default 2 for dollars, 1 for cents) */
  decimals?: number | string
  /** Currency symbol for the dollars format */
  currency?: string
  /** Text after the number */
  suffix?: string
}

/** 18.99, "18.99", "$1,299.00" → number; anything else → NaN */
export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return Number.NaN
  const clean = value.replace(/[$,\s]/g, '')
  return /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(clean) ? Number(clean) : Number.NaN
}

/**
 * Same rounding as the gunsnprices parser (Python round(x, 4): exact ties go to the even digit),
 * copied so cost per round with a known round count needs no parser on the client.
 */
function round4(x: number): number {
  const s = x.toFixed(20)
  const dot = s.indexOf('.')
  if (s[dot + 5] === '5' && /^0*$/.test(s.slice(dot + 6))) {
    const f = Math.floor(x * 10000)
    return (f % 2 === 0 ? f : f + 1) / 10000
  }
  return Number.parseFloat(x.toFixed(4))
}

/** Price of one round, rounded to 4 decimals; null without a price or a round count. */
export function costPerRound(price: number, rounds: number | null | undefined): number | null {
  if (!price || !rounds || price <= 0 || rounds <= 0) return null
  return round4(price / rounds)
}

/** A caliber written any way; if it doesn't normalize, the first caliber found in it (so a whole title works). */
export function resolveCaliber(gnp: Parser, value?: string | null, text?: string | null): Caliber | null {
  const v = value ? String(value).trim() : ''
  if (v) return gnp.normalizeCaliber(v) || gnp.findCaliber(v)
  if (text) return gnp.findCaliber(String(text))
  return null
}

/** Rounds from a title ('50 Rounds', '1000rd case', '20/box'), then the cost per round. */
export function resolveCostPerRound(gnp: Parser | null, price: unknown, rounds?: unknown, title?: string | null) {
  const p = toNumber(price)
  let count = rounds != null && rounds !== '' ? toNumber(rounds) : Number.NaN
  if (!(count > 0) && title && gnp) count = gnp.roundsPerBox(String(title)) ?? Number.NaN
  const r = count > 0 ? Math.round(count) : null
  return { cpr: p > 0 ? costPerRound(p, r) : null, rounds: r }
}

export function formatCostPerRound(cpr: number, opts: CostPerRoundFormat = {}): string {
  const suffix = opts.suffix ?? '/rd'
  const decimals = opts.decimals != null && opts.decimals !== '' ? Number(opts.decimals) : undefined
  return opts.format === 'cents'
    ? `${(cpr * 100).toFixed(decimals ?? 1)}¢${suffix}`
    : `${opts.currency ?? '$'}${cpr.toFixed(decimals ?? 2)}${suffix}`
}

/** Spec rows for a listing title: the same rows as astro-gunsnprices <ProductSpecs>. */
export function buildProductSpecs(gnp: Parser, title: string, opts: ProductSpecsOptions = {}): ProductSpecs {
  const price = opts.price != null && opts.price !== '' ? toNumber(opts.price) : Number.NaN
  const info = gnp.parseTitle(String(title || ''), {
    brand: opts.brand || undefined,
    mpn: opts.mpn || undefined,
    price: price > 0 ? price : undefined,
    kind: opts.kind === 'firearm' || opts.kind === 'ammo' ? opts.kind : undefined,
  })
  const currency = opts.currency ?? '$'
  const rows: SpecRow[] = []
  if (info.brand) rows.push({ label: 'Brand', value: info.brand })
  if (info.model) {
    rows.push({ label: 'Model', value: info.model.model })
    if (info.model.configs.length) rows.push({ label: 'Configuration', value: info.model.configs.join(', ') })
    if (info.model.features.length) rows.push({ label: 'Features', value: info.model.features.join(', ') })
  }
  const [first] = info.calibers
  if (first) {
    const row: SpecRow = {
      label: info.calibers.length > 1 ? 'Calibers' : 'Caliber',
      value: info.calibers.map(c => c.name).join(' / '),
    }
    if (opts.link && info.calibers.length === 1 && first.url) row.href = first.url
    rows.push(row)
  }
  if (info.capacity) rows.push({ label: 'Capacity', value: `${info.capacity} rounds` })
  if (info.barrelLength) rows.push({ label: 'Barrel', value: `${info.barrelLength}"` })
  if (info.rounds) rows.push({ label: 'Rounds per box', value: String(info.rounds) })
  if (info.costPerRound != null) rows.push({ label: 'Cost per round', value: `${currency}${info.costPerRound.toFixed(2)}` })
  return { info, rows }
}
