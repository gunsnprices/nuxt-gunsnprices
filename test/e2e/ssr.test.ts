import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup, useTestContext } from '@nuxt/test-utils/e2e'

const section = (html: string, id: string) => {
  const start = html.indexOf(`<section id="${id}">`)
  return html.slice(start, html.indexOf('</section>', start))
}

describe('server-rendered components and composables', async () => {
  await setup({ rootDir: fileURLToPath(new URL('../fixtures/basic', import.meta.url)) })

  it('GnpProductSpecs', async () => {
    const html = await $fetch<string>('/')
    const firearm = section(html, 'specs-firearm')
    expect(firearm).toContain('<dl class="gnp-specs" data-kind="firearm">')
    expect(firearm).toContain('<dt>Model</dt><dd>Glock 19 Gen 5 MOS</dd>')
    expect(firearm).toContain('<dt>Configuration</dt><dd>MOS</dd>')
    expect(firearm).toContain('<dt>Caliber</dt><dd>9×19mm Parabellum</dd>')
    expect(firearm).toContain('<dt>Capacity</dt><dd>15 rounds</dd>')
    expect(firearm).toContain('<dt>Barrel</dt><dd>4.02&quot;</dd>')
    expect(firearm).not.toContain('<a ')

    const ammo = section(html, 'specs-ammo')
    expect(ammo).toContain('<dl class="gnp-specs extra" data-kind="ammo">')
    expect(ammo).toContain('<dt>Rounds per box</dt><dd>50</dd>')
    expect(ammo).toContain('<dt>Cost per round</dt><dd>$0.38</dd>')

    expect(section(html, 'specs-link')).toContain('<dd><a href="https://gunsnprices.com/ammo/handgun-ammo/9-19mm-parabellum">9×19mm Parabellum</a></dd>')
    expect(section(html, 'specs-empty')).not.toContain('gnp-specs')
  })

  it('GnpCaliberBadge', async () => {
    const badges = section(await $fetch<string>('/'), 'badges')
    expect(badges).toContain('<span class="gnp-caliber" data-caliber="9x19mmparabellum" data-type="handgun">9×19mm Parabellum <span class="gnp-caliber__type">handgun</span></span>')
    expect(badges).toMatch(/<a class="gnp-caliber" href="https:\/\/gunsnprices\.com\/ammo\/rifle-ammo\/5-56-45mm-nato"[^>]*>5\.56×45mm NATO/)
    expect(badges).toContain('<span class="gnp-caliber gnp-caliber--unknown">zzz-not-a-caliber</span>')
  })

  it('GnpCostPerRound', async () => {
    const cpr = section(await $fetch<string>('/'), 'cpr')
    expect(cpr).toContain('<span class="gnp-cpr" data-cpr="0.3798" data-rounds="50">$0.38/rd</span>')
    expect(cpr).toContain('<span class="gnp-cpr" data-cpr="0.29" data-rounds="1000">29.0¢/rd</span>')
    expect(cpr).toMatch(/<span class="gnp-cpr gnp-cpr--unknown">(<!--\[-->)?\s*n\/a\s*(<!--\]-->)?<\/span>/)
  })

  it('composables', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('<li>caliber=.300 AAC Blackout|rifle</li>')
    expect(html).toContain('<li>cpr=0.29</li>')
    expect(html).toContain('<li>cprKnown=0.3798</li>')
    expect(html).toContain('<li>model=Ruger 10/22 Carbine|rows=6</li>')
  })

  it('results travel in the payload, the parser stays out of the entry chunk', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('$sgunsnprices')

    const publicDir = join(useTestContext().nuxt!.options.nitro.output!.dir!, 'public', '_nuxt')
    const chunks = readdirSync(publicDir).filter(f => f.endsWith('.js'))
    const withData = chunks.filter(f => readFileSync(join(publicDir, f), 'utf8').includes('9x19mmparabellum'))
    expect(withData).toHaveLength(1)
    const entry = html.match(/<script type="module" src="\/_nuxt\/([^"]+)"/)![1]
    expect(withData).not.toContain(entry)
    expect(html).not.toContain(`rel="modulepreload" as="script" crossorigin href="/_nuxt/${withData[0]}"`)
  })

  it('adds the stylesheet', async () => {
    const html = await $fetch<string>('/')
    const href = html.match(/<link rel="stylesheet" href="(\/_nuxt\/entry[^"]+\.css)"/)?.[1]
    expect(href).toBeTruthy()
    expect(await $fetch<string>(href!)).toContain('.gnp-specs')
  })
})
