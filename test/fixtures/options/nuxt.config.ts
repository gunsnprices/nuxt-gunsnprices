import GunsNPrices from '../../../src/module'

export default defineNuxtConfig({
  modules: [GunsNPrices],
  compatibilityDate: 'latest',
  gunsnprices: {
    prefix: 'Gun',
    components: { CostPerRound: false },
    composables: false,
    link: true,
    css: false,
  },
})
