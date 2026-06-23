<template>
  <DsfrHeader
    service-title="Prototype pages territoires data.gouv.fr"
    service-description="Hackathon Fabrique de la donnée territoriale 2026"
    home-to="/"
    :quick-links="[{ label: 'À propos', to: '/a-propos' }]"
  />

  <RouterView />

  <DsfrFooter :mandatoryLinks="[]" />
</template>
