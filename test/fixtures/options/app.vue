<template>
  <main>
    <GunProductSpecs
      id="linked"
      title="Glock 19 Gen 5 9mm"
    />
    <GunProductSpecs
      id="unlinked"
      title="Glock 19 Gen 5 9mm"
      :link="false"
    />
    <GunCaliberBadge value="5.56 NATO" />
    <!-- disabled in nuxt.config: renders nothing -->
    <GunCostPerRound
      :price="18.99"
      :rounds="50"
    />
  </main>
</template>
