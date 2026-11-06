import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('module options', async () => {
  await setup({ rootDir: fileURLToPath(new URL('../fixtures/options', import.meta.url)) })

  it('prefix, site-wide link, disabled component, no stylesheet', async () => {
    const html = await $fetch<string>('/')
    expect(html).toMatch(/<dl class="gnp-specs" data-kind="firearm" id="linked">.*?<dd><a href="https:\/\/gunsnprices\.com\//)
    const at = html.indexOf('id="unlinked"')
    const unlinked = html.slice(at, html.indexOf('</dl>', at))
    expect(unlinked).toContain('<dd>9×19mm Parabellum</dd>')
    expect(html).toMatch(/<a class="gnp-caliber" href="https:\/\/gunsnprices\.com\/ammo\/rifle-ammo\/5-56-45mm-nato"/)
    expect(html).not.toContain('gnp-cpr')
    expect(html).not.toMatch(/\.gnp-specs\s*\{/)
    expect(html).not.toMatch(/<link rel="stylesheet" href="\/_nuxt\/entry/)
  })
})
