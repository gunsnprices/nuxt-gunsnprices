<script setup lang="ts">
const caliber = useCaliber('.300 BLK')
const cpr = useCostPerRound(289.99, 'Winchester 9mm 115gr FMJ 1000 Round Case')
const specs = useProductSpecs('Ruger 10/22 Carbine .22 LR 18.5" 10rd')
</script>

<template>
  <main>
    <h1>nuxt-gunsnprices playground</h1>

    <h2>GnpProductSpecs</h2>
    <GnpProductSpecs title="Glock 19 Gen 5 MOS 9mm 4.02&quot; 15rd Pistol" />
    <GnpProductSpecs
      title="Federal American Eagle 9mm Luger 115gr FMJ 50 Rounds"
      :price="18.99"
      link
    />

    <h2>GnpCaliberBadge</h2>
    <p>
      <GnpCaliberBadge value="9mm Luger" />
      <GnpCaliberBadge
        value=".300 BLK"
        show-type
      />
      <GnpCaliberBadge
        text="PMC Bronze 5.56 NATO 55gr FMJ"
        link
      />
      <GnpCaliberBadge value="zzz-not-a-caliber" />
    </p>

    <h2>GnpCostPerRound</h2>
    <p>
      <GnpCostPerRound
        :price="18.99"
        :rounds="50"
      />
      <GnpCostPerRound
        :price="289.99"
        title="Winchester 9mm 115gr FMJ 1000 Round Case"
        format="cents"
      />
      <GnpCostPerRound :price="24.99">
        n/a
      </GnpCostPerRound>
    </p>

    <h2>Composables</h2>
    <ul>
      <li id="use-caliber">
        useCaliber: {{ caliber?.name }} ({{ caliber?.type }})
      </li>
      <li id="use-cpr">
        useCostPerRound: {{ cpr }}
      </li>
      <li id="use-specs">
        useProductSpecs: {{ specs?.info.model?.model }}, {{ specs?.rows.length }} rows
      </li>
    </ul>
  </main>
</template>
