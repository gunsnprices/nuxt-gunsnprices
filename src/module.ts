import { addComponent, addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export type { Caliber, ModelMatch, ProductInfo } from 'gunsnprices'
export type { CostPerRoundFormat, ProductSpecs, ProductSpecsOptions, SpecRow } from './runtime/core'

const COMPONENTS = ['ProductSpecs', 'CaliberBadge', 'CostPerRound'] as const
type ComponentName = (typeof COMPONENTS)[number]

export interface ModuleOptions {
  /**
   * Prefix for the component names: `Gnp` gives `<GnpProductSpecs>`, `<GnpCaliberBadge>`, `<GnpCostPerRound>`.
   * @default 'Gnp'
   */
  prefix: string
  /**
   * Register the components. `false` registers none; an object picks them one by one,
   * e.g. `{ CostPerRound: false }`.
   * @default true
   */
  components: boolean | Partial<Record<ComponentName, boolean>>
  /**
   * Auto-import `useCaliber`, `useCostPerRound` and `useProductSpecs`.
   * @default true
   */
  composables: boolean
  /**
   * Default for the components' `link` prop: link calibers to their GunsNPrices price comparison page.
   * @default false
   */
  link: boolean
  /**
   * Add the small stylesheet for the `gnp-*` classes.
   * @default true
   */
  css: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-gunsnprices',
    configKey: 'gunsnprices',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    prefix: 'Gnp',
    components: true,
    composables: true,
    link: false,
    css: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.gunsnprices = { link: options.link === true }

    // The parser itself is only bundled for the server; see runtime/parsed.ts.
    addPlugin({ src: resolver.resolve('./runtime/plugins/parser.server'), mode: 'server' })

    if (options.css) {
      nuxt.options.css.push(resolver.resolve('./runtime/gunsnprices.css'))
    }

    if (options.composables) {
      addImports(
        ['useCaliber', 'useCostPerRound', 'useProductSpecs'].map(name => ({
          name,
          from: resolver.resolve('./runtime/composables'),
        })),
      )
    }

    for (const name of COMPONENTS) {
      const enabled = typeof options.components === 'object'
        ? options.components[name] !== false
        : options.components !== false
      if (!enabled) continue
      addComponent({
        name: `${options.prefix}${name}`,
        filePath: resolver.resolve(`./runtime/components/${name}.vue`),
      })
    }
  },
})
