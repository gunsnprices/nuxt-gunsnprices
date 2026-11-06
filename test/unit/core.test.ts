import { describe, expect, it } from 'vitest'
import * as gnp from 'gunsnprices'
import { buildProductSpecs, costPerRound, formatCostPerRound, resolveCaliber, resolveCostPerRound, toNumber } from '../../src/runtime/core'

describe('resolveCaliber', () => {
  it('normalizes, then searches', () => {
    expect(resolveCaliber(gnp, '9mm Luger')?.name).toBe('9×19mm Parabellum')
    expect(resolveCaliber(gnp, '12ga')?.type).toBe('shotgun')
    expect(resolveCaliber(gnp, undefined, 'PMC Bronze 5.56 NATO 55gr FMJ')?.id).toBe('5-56x45mmnato')
    expect(resolveCaliber(gnp, 'zzz-not-a-caliber')).toBeNull()
    expect(resolveCaliber(gnp, '')).toBeNull()
  })
})

describe('cost per round', () => {
  it('matches the parser exactly, ties included', () => {
    const cases: [number, number][] = [[18.99, 50], [289.99, 1000], [0.53125, 1], [10.625, 20], [1, 3], [24.99, 25]]
    for (let i = 0; i < 5000; i++) cases.push([Math.round(Math.random() * 100000) / 100, 1 + Math.floor(Math.random() * 2000)])
    for (const [price, rounds] of cases) expect(costPerRound(price, rounds)).toBe(gnp.costPerRound(price, rounds))
  })
  it('reads rounds from a title', () => {
    expect(resolveCostPerRound(gnp, 289.99, undefined, 'Winchester 9mm 1000 Round Case')).toEqual({ cpr: 0.29, rounds: 1000 })
    expect(resolveCostPerRound(null, '$18.99', '50')).toEqual({ cpr: 0.3798, rounds: 50 })
    expect(resolveCostPerRound(gnp, 24.99)).toEqual({ cpr: null, rounds: null })
  })
  it('formats', () => {
    expect(formatCostPerRound(0.3798)).toBe('$0.38/rd')
    expect(formatCostPerRound(0.29, { format: 'cents' })).toBe('29.0¢/rd')
    expect(formatCostPerRound(0.3798, { currency: '€', decimals: 3, suffix: ' per round' })).toBe('€0.380 per round')
  })
  it('toNumber', () => {
    expect(toNumber('$1,299.00')).toBe(1299)
    expect(Number.isNaN(toNumber('abc'))).toBe(true)
  })
})

describe('buildProductSpecs', () => {
  it('firearm rows, no link by default', () => {
    const { info, rows } = buildProductSpecs(gnp, 'Glock 19 Gen 5 MOS 9mm 4.02" 15rd Pistol')
    expect(info.kind).toBe('firearm')
    expect(rows).toEqual([
      { label: 'Brand', value: 'Glock' },
      { label: 'Model', value: 'Glock 19 Gen 5 MOS' },
      { label: 'Configuration', value: 'MOS' },
      { label: 'Caliber', value: '9×19mm Parabellum' },
      { label: 'Capacity', value: '15 rounds' },
      { label: 'Barrel', value: '4.02"' },
    ])
  })
  it('ammo with price, link on', () => {
    const { rows } = buildProductSpecs(gnp, 'Federal American Eagle 9mm Luger 115gr FMJ 50 Rounds', { price: 18.99, link: true })
    expect(rows).toContainEqual({ label: 'Caliber', value: '9×19mm Parabellum', href: 'https://gunsnprices.com/ammo/handgun-ammo/9-19mm-parabellum' })
    expect(rows).toContainEqual({ label: 'Cost per round', value: '$0.38' })
  })
})
