<template>
  <DsfrHeader
    service-title="GéoFabrique 2026"
    service-description="Hackathon"
    home-to="/"
    :quick-links="[{ label: 'À propos', to: '/a-propos' }]"
  />

  <RouterView />

  <DsfrFooter :mandatoryLinks="[]" />
</template>
