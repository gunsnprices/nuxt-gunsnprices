<script setup lang="ts">
import { computed } from 'vue'
import { formatCostPerRound, resolveCostPerRound, toNumber } from '../core'
import { useParsed } from '../parsed'

const props = withDefaults(defineProps<{
  /** Price of the box or case */
  price: number | string
  /** Rounds in the box or case */
  rounds?: number | string
  /** Or the listing title: rounds are read from it ('50 Rounds', '1000rd case', '20/box') */
  title?: string
  /** 'dollars' → $0.38/rd, 'cents' → 38.0¢/rd */
  format?: 'dollars' | 'cents'
  /** Decimal places (default 2 for dollars, 1 for cents) */
  decimals?: number | string
  /** Currency symbol for the dollars format */
  currency?: string
  /** Text after the number */
  suffix?: string
}>(), { format: 'dollars', currency: '$', suffix: '/rd' })

// A known round count is plain arithmetic; only a title needs the parser.
const known = computed(() => toNumber(props.rounds) > 0)
const fromTitle = useParsed(
  'cpr-box',
  () => (known.value || !props.title ? null : { price: props.price, title: props.title }),
  (gnp, input) => resolveCostPerRound(gnp, input.price, undefined, input.title),
)
const result = computed(() => {
  if (known.value || !props.title) return resolveCostPerRound(null, props.price, props.rounds)
  return fromTitle.value
})
const label = computed(() =>
  result.value?.cpr != null
    ? formatCostPerRound(result.value.cpr, { format: props.format, decimals: props.decimals, currency: props.currency, suffix: props.suffix })
    : '',
)
</script>

<template>
  <span
    v-if="result && result.cpr != null"
    class="gnp-cpr"
    :data-cpr="result.cpr"
    :data-rounds="result.rounds ?? undefined"
  >{{ label }}</span>
  <span
    v-else-if="result && $slots.default"
    class="gnp-cpr gnp-cpr--unknown"
  ><slot /></span>
</template>
