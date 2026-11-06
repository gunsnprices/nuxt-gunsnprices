<script setup lang="ts">
import { computed } from 'vue'
import { resolveCaliber } from '../core'
import { useLinkDefault, useParsed } from '../parsed'

const props = withDefaults(defineProps<{
  /** A caliber as written anywhere: '9mm Luger', '.223', '5.56 NATO', '12 ga' */
  value?: string
  /** Or any text, e.g. a product title: the first caliber found is used */
  text?: string
  /** Show the caliber class (handgun, rifle, rimfire, shotgun ...) */
  showType?: boolean
  /** Link to the GunsNPrices price comparison page for this caliber (off by default) */
  link?: boolean
}>(), { link: undefined })

const link = useLinkDefault(() => props.link)
const caliber = useParsed(
  'badge',
  () => (props.value || props.text ? { value: props.value || '', text: props.text || '' } : null),
  (gnp, input) => resolveCaliber(gnp, input.value, input.text),
)
const href = computed(() => (link.value && caliber.value?.url ? caliber.value.url : undefined))
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    v-if="caliber"
    class="gnp-caliber"
    :href="href"
    :data-caliber="caliber.id"
    :data-type="caliber.type"
  >
    {{ caliber.name + (showType ? ' ' : '') }}<span
      v-if="showType"
      class="gnp-caliber__type"
    >{{ caliber.type }}</span>
  </component>
  <span
    v-else-if="value"
    class="gnp-caliber"
    :class="{ 'gnp-caliber--unknown': caliber === null }"
  >{{ value }}</span>
</template>
