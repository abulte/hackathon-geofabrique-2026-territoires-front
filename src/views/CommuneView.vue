<template>
  <div class="fr-container fr-my-6w">
    <DsfrBreadcrumb :links="[{ to: '/', text: 'Accueil' }, { text: commune?.nom ?? code }]" />

    <div v-if="loading">Chargement…</div>

    <template v-else-if="commune">
      <h1>{{ commune.nom }}</h1>
      <p class="fr-text--lead">Code INSEE : <strong>{{ commune.code }}</strong></p>
      <ul class="fr-raw-list">
        <li>Département : {{ commune.codeDepartement }}</li>
        <li>Région : {{ commune.codeRegion }}</li>
        <li v-if="commune.population">Population : {{ commune.population.toLocaleString('fr-FR') }}</li>
      </ul>
    </template>

    <DsfrAlert v-else type="error" title="Commune introuvable" :description="`Aucune commune avec le code ${code}.`" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface Commune {
  nom: string
  code: string
  codeDepartement: string
  codeRegion: string
  population?: number
}

const route = useRoute()
const code = route.params.code as string
const commune = ref<Commune | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes/${code}?fields=nom,code,codeDepartement,codeRegion,population`,
    )
    if (res.ok) commune.value = await res.json()
  } finally {
    loading.value = false
  }
})
</script>
