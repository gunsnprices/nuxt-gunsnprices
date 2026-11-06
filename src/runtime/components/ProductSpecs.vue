<script setup lang="ts">
import { useProductSpecs } from '../composables'
import { useLinkDefault } from '../parsed'

const props = withDefaults(defineProps<{
  /** Product listing title, e.g. 'Glock 19 Gen 5 9mm 4.02" 15rd Pistol' */
  title: string
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
}>(), { link: undefined, currency: '$' })

const link = useLinkDefault(() => props.link)
const specs = useProductSpecs(
  () => props.title,
  () => ({ brand: props.brand, mpn: props.mpn, price: props.price, kind: props.kind, link: link.value, currency: props.currency }),
)
</script>

<template>
  <dl
    v-if="specs && specs.rows.length"
    class="gnp-specs"
    :data-kind="specs.info.kind"
  >
    <div
      v-for="row in specs.rows"
      :key="row.label"
      class="gnp-specs__row"
    >
      <dt>{{ row.label }}</dt>
      <dd v-if="row.href">
        <a :href="row.href">{{ row.value }}</a>
      </dd>
      <dd v-else>
        {{ row.value }}
      </dd>
    </div>
  </dl>
</template>
