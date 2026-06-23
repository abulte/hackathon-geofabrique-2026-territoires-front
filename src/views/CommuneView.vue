<template>
  <div class="fr-container fr-my-6w">
    <DsfrBreadcrumb :links="[{ to: '/', text: 'Accueil' }, { text: commune?.nom ?? code }]" />

    <div v-if="loading">Chargement…</div>

    <template v-else-if="commune">
      <h1>{{ commune.nom }}</h1>
      <p class="fr-text--lead">Code INSEE : <strong>{{ commune.code }}</strong></p>
      <ul class="fr-raw-list fr-mb-4w">
        <li>Département : {{ commune.codeDepartement }}</li>
        <li>Région : {{ commune.codeRegion }}</li>
        <li v-if="commune.population">Population : {{ commune.population.toLocaleString('fr-FR') }}</li>
      </ul>

      <h2>Jeux de données data.gouv.fr</h2>

      <div v-if="orgsLoading">Chargement…</div>

      <p v-else-if="orgs.length === 0" class="fr-text-mention--grey">
        Aucune organisation data.gouv.fr trouvée pour cette commune.
      </p>

      <template v-else>
        <section v-for="org in orgs" :key="org.id" class="fr-mb-4w">
          <h3>{{ org.name }}</h3>

          <div v-if="org.datasetsLoading">Chargement…</div>

          <p v-else-if="org.datasets.length === 0" class="fr-text-mention--grey">
            Aucun jeu de données.
          </p>

          <ul v-else class="fr-raw-list">
            <li v-for="ds in org.datasets" :key="ds.id" class="fr-py-1w" style="border-bottom: 1px solid var(--border-default-grey)">
              <a :href="ds.page" target="_blank" rel="noopener" class="fr-link">{{ ds.title }}</a>
            </li>
          </ul>
        </section>
      </template>
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

interface Dataset {
  id: string
  title: string
  page: string
}

interface Org {
  id: string
  name: string
  siren: string
  datasets: Dataset[]
  datasetsLoading: boolean
}

const route = useRoute()
const code = route.params.code as string
const commune = ref<Commune | null>(null)
const loading = ref(true)
const orgs = ref<Org[]>([])
const orgsLoading = ref(false)

onMounted(async () => {
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes/${code}?fields=nom,code,codeDepartement,codeRegion,population`,
    )
    if (res.ok) {
      commune.value = await res.json()
      fetchOrgs()
    }
  } finally {
    loading.value = false
  }
})

async function fetchOrgs() {
  orgsLoading.value = true
  try {
    const res = await fetch(
      `https://tabular-api.data.gouv.fr/api/resources/9ce1f9d6-5924-4f28-9cc0-b53d12073d6f/data/?code_insee_commune__exact=${code}`,
    )
    const json = await res.json()
    orgs.value = json.data.map((row: any) => ({
      id: row.id,
      name: row.name,
      siren: row.siren,
      datasets: [],
      datasetsLoading: true,
    }))
  } finally {
    orgsLoading.value = false
  }

  orgs.value.forEach(fetchDatasets)
}

async function fetchDatasets(org: Org) {
  try {
    const res = await fetch(
      `https://www.data.gouv.fr/api/1/organizations/${org.id}/datasets/?page_size=100`,
    )
    const json = await res.json()
    org.datasets = json.data.map((ds: any) => ({ id: ds.id, title: ds.title, page: ds.page }))
  } finally {
    org.datasetsLoading = false
  }
}
</script>
