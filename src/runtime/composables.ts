import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import type { Caliber } from 'gunsnprices'
import { buildProductSpecs, resolveCaliber, resolveCostPerRound, toNumber, type ProductSpecs, type ProductSpecsOptions } from './core'
import { useParsed } from './parsed'

type Input = string | null | undefined

/**
 * Normalizes a caliber written any way ('9mm Luger', '.223 Rem', '5.56 NATO', '12ga'),
 * or finds the first caliber in a longer text such as a product title.
 *
 * @example const caliber = useCaliber('9mm Luger') // caliber.value?.name === '9×19mm Parabellum'
 */
export function useCaliber(value: MaybeRefOrGetter<Input>): ComputedRef<Caliber | null> {
  const result = useParsed(
    'caliber',
    () => {
      const caliber = toValue(value)
      return caliber ? { value: caliber } : null
    },
    (gnp, input) => resolveCaliber(gnp, input.value),
  )
  return computed(() => result.value ?? null)
}

/**
 * Price of one round. The second argument is the round count, or a listing title to read it from
 * ('50 Rounds', '1000rd case', '20/box').
 *
 * @example useCostPerRound(18.99, 50).value // 0.3798
 * @example useCostPerRound(289.99, 'Winchester 9mm 115gr FMJ 1000 Round Case').value // 0.29
 */
export function useCostPerRound(
  price: MaybeRefOrGetter<number | string | null | undefined>,
  roundsOrTitle: MaybeRefOrGetter<number | string | null | undefined>,
): ComputedRef<number | null> {
  const known = computed(() => {
    const rounds = toValue(roundsOrTitle)
    return typeof rounds === 'number' || (typeof rounds === 'string' && toNumber(rounds) > 0)
  })
  // A known round count is plain arithmetic; only titles need the parser.
  const fromTitle = useParsed(
    'cpr',
    () => {
      const title = toValue(roundsOrTitle)
      return known.value || !title ? null : { price: toValue(price) ?? null, title: String(title) }
    },
    (gnp, input) => resolveCostPerRound(gnp, input.price, undefined, input.title).cpr,
  )
  return computed(() =>
    known.value ? resolveCostPerRound(null, toValue(price), toValue(roundsOrTitle)).cpr : fromTitle.value ?? null,
  )
}

/**
 * Reads a listing title: brand, model, caliber, capacity, barrel length, rounds per box, cost per round.
 * `rows` are the label/value pairs that <GnpProductSpecs> renders.
 *
 * @example
 * const specs = useProductSpecs('Glock 19 Gen 5 MOS 9mm 4.02" 15rd Pistol')
 * specs.value?.info.model?.model // 'Glock 19 Gen 5 MOS'
 */
export function useProductSpecs(
  title: MaybeRefOrGetter<Input>,
  options?: MaybeRefOrGetter<ProductSpecsOptions | undefined>,
): ComputedRef<ProductSpecs | null> {
  const result = useParsed(
    'specs',
    () => {
      const specs = toValue(title)
      return specs ? { ...toValue(options), title: specs } : null
    },
    (gnp, { title: specs, ...opts }) => buildProductSpecs(gnp, specs, opts),
  )
  return computed(() => result.value ?? null)
}
