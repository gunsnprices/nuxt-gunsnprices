import * as parser from 'gunsnprices'
import { defineNuxtPlugin } from '#imports'

// Server bundle only: the parser for SSR. The browser gets results through the payload.
export default defineNuxtPlugin({
  name: 'gunsnprices:parser',
  setup: () => ({ provide: { gunsnpricesParser: parser } }),
})
