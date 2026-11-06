// Runs the components in a browser-like Nuxt app (happy-dom), where nothing came from SSR:
// the parser is loaded on demand, as after a client-side navigation.
import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, nextTick, ref } from 'vue'
import { GnpCaliberBadge, GnpCostPerRound, GnpProductSpecs } from '#components'
import { useCaliber, useCostPerRound, useProductSpecs } from '../../src/runtime/composables'

const settle = (check: () => void) => vi.waitFor(check, { timeout: 5000, interval: 20 })

describe('client-side rendering', () => {
  it('GnpProductSpecs fills in once the parser loads', async () => {
    const wrapper = await mountSuspended(GnpProductSpecs, { props: { title: 'Glock 19 Gen 5 MOS 9mm 4.02" 15rd Pistol' } })
    await settle(() => expect(wrapper.html()).toContain('Glock 19 Gen 5 MOS'))
    expect(wrapper.find('dl').attributes('data-kind')).toBe('firearm')
    expect(wrapper.findAll('dt').map(dt => dt.text())).toEqual(['Brand', 'Model', 'Configuration', 'Caliber', 'Capacity', 'Barrel'])
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('GnpCaliberBadge, linked on request', async () => {
    const wrapper = await mountSuspended(GnpCaliberBadge, { props: { value: '300 BLK', showType: true, link: true } })
    await settle(() => expect(wrapper.text()).toBe('.300 AAC Blackout rifle'))
    expect(wrapper.find('a').attributes('href')).toBe('https://gunsnprices.com/ammo/rifle-ammo/300-aac-blackout')
  })

  it('GnpCaliberBadge marks an unknown value only after the lookup', async () => {
    const wrapper = await mountSuspended(GnpCaliberBadge, { props: { value: 'zzz-not-a-caliber' } })
    await settle(() => expect(wrapper.classes()).toContain('gnp-caliber--unknown'))
    expect(wrapper.text()).toBe('zzz-not-a-caliber')
  })

  it('GnpCostPerRound: a round count needs no parser, a title does', async () => {
    const known = await mountSuspended(GnpCostPerRound, { props: { price: 18.99, rounds: 50 } })
    expect(known.html()).toBe('<span class="gnp-cpr" data-cpr="0.3798" data-rounds="50">$0.38/rd</span>')
    const fromTitle = await mountSuspended(GnpCostPerRound, { props: { price: 289.99, title: 'Winchester 9mm 1000 Round Case', format: 'cents' } })
    await settle(() => expect(fromTitle.text()).toBe('29.0¢/rd'))
    const unknown = await mountSuspended(GnpCostPerRound, { props: { price: 10 }, slots: { default: () => 'n/a' } })
    expect(unknown.html()).toBe('<span class="gnp-cpr gnp-cpr--unknown">n/a</span>')
  })

  it('composables react to changing input', async () => {
    const title = ref('Sig Sauer P365 XL 9mm 3.1" 12+1')
    const Probe = defineComponent({
      setup() {
        const specs = useProductSpecs(title)
        const caliber = useCaliber(() => specs.value?.info.caliber?.name)
        const cpr = useCostPerRound(24.99, 'Hornady Critical Defense 9mm 115gr FTX 25rd')
        return () => h('p', `${specs.value?.info.model?.model}|${caliber.value?.type}|${cpr.value}`)
      },
    })
    const wrapper = await mountSuspended(Probe)
    await settle(() => expect(wrapper.text()).toBe('Sig Sauer P365 XL|handgun|0.9996'))
    title.value = 'Ruger 10/22 Carbine .22 LR 18.5" 10rd'
    await nextTick()
    await settle(() => expect(wrapper.text()).toBe('Ruger 10/22 Carbine|rimfire|0.9996'))
  })
})
