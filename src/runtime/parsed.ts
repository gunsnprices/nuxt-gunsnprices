import { computed, watch, type ComputedRef } from 'vue'
import { useNuxtApp, useRuntimeConfig, useState } from '#imports'
import type { Parser } from './core'

// The parser carries ~450 kB of model and caliber data. On the server it comes from a server-only
// plugin (plugins/parser.server), and results computed during SSR travel to the browser in the Nuxt
// payload (useState), so a server-rendered page hydrates without the parser. Inputs the server never
// saw (client-side navigation, ssr: false) load it in the browser on demand, as a separate chunk.

let clientParser: Parser | undefined
let loading: Promise<Parser> | undefined

function loadParser(): Promise<Parser> {
  loading ||= import('gunsnprices').then(
    (mod) => {
      clientParser = mod
      return mod
    },
    (err) => {
      loading = undefined
      throw err
    },
  )
  return loading
}

/**
 * Runs `compute` once per distinct input and shares the result through the payload.
 * The ref is `undefined` while the parser is still loading in the browser, and when `input` returns null
 * (nothing to parse).
 */
export function useParsed<I, T>(
  name: string,
  input: () => I | null,
  compute: (gnp: Parser, input: I) => T,
): ComputedRef<T | undefined> {
  const nuxtApp = useNuxtApp()
  const store = useState<Record<string, T>>('gunsnprices', () => ({}))
  const keyOf = (value: I) => `${name}:${JSON.stringify(value)}`

  const ensure = (value: I | null) => {
    if (value == null) return
    const key = keyOf(value)
    if (key in store.value) return
    if (import.meta.server) {
      store.value[key] = compute(nuxtApp.$gunsnpricesParser as Parser, value)
      return
    }
    if (clientParser) {
      store.value[key] = compute(clientParser, value)
      return
    }
    loadParser()
      .then((gnp) => {
        if (!(key in store.value)) store.value[key] = compute(gnp, value)
      })
      .catch((err) => {
        console.error('[nuxt-gunsnprices] could not load the gunsnprices parser', err)
      })
  }

  ensure(input())
  if (import.meta.client) watch(input, ensure)
  return computed(() => {
    const value = input()
    return value == null ? undefined : store.value[keyOf(value)]
  })
}

/** `link` prop if set, else the module's `link` option (false unless the site turned it on). */
export function useLinkDefault(prop: () => boolean | undefined): ComputedRef<boolean> {
  const config = useRuntimeConfig().public.gunsnprices as { link?: boolean } | undefined
  return computed(() => prop() ?? config?.link === true)
}
