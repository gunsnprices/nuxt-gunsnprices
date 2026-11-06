<script setup lang="ts">
const caliber = useCaliber('.300 BLK')
const cpr = useCostPerRound(289.99, 'Winchester 9mm 115gr FMJ 1000 Round Case')
const cprKnown = useCostPerRound(18.99, 50)
const specs = useProductSpecs('Ruger 10/22 Carbine .22 LR 18.5" 10rd')
</script>

<template>
  <main>
    <section id="specs-firearm">
      <GnpProductSpecs title="Glock 19 Gen 5 MOS 9mm 4.02&quot; 15rd Pistol" />
    </section>
    <section id="specs-ammo">
      <GnpProductSpecs
        title="Federal American Eagle 9mm Luger 115gr FMJ 50 Rounds"
        :price="18.99"
        class="extra"
      />
    </section>
    <section id="specs-link">
      <GnpProductSpecs
        title="Glock 19 Gen 5 9mm"
        link
      />
    </section>
    <section id="specs-empty">
      <GnpProductSpecs title="Hello world" />
    </section>
    <section id="badges">
      <GnpCaliberBadge
        value="9mm Luger"
        show-type
      />
      <GnpCaliberBadge
        text="PMC Bronze 5.56 NATO 55gr 20rd"
        link
      />
      <GnpCaliberBadge value="zzz-not-a-caliber" />
    </section>
    <section id="cpr">
      <GnpCostPerRound
        :price="18.99"
        :rounds="50"
      />
      <GnpCostPerRound
        :price="289.99"
        title="Winchester 9mm 115gr FMJ 1000 Round Case"
        format="cents"
      />
      <GnpCostPerRound :price="10">
        n/a
      </GnpCostPerRound>
    </section>
    <ul id="composables">
      <li>caliber={{ caliber?.name }}|{{ caliber?.type }}</li>
      <li>cpr={{ cpr }}</li>
      <li>cprKnown={{ cprKnown }}</li>
      <li>model={{ specs?.info.model?.model }}|rows={{ specs?.rows.length }}</li>
    </ul>
    <NuxtLink
      id="to-second"
      to="/second"
    >
      second
    </NuxtLink>
  </main>
</template>
