<template>
  <div class="fr-container fr-my-6w">
    <DsfrBreadcrumb :links="[{ to: '/', text: 'Accueil' }, { text: commune?.nom ?? code }]" />

    <div v-if="loading">Chargement…</div>

    <template v-else-if="commune">
      <!-- Header -->
      <h1 class="fr-mb-1w">{{ commune.nom }}</h1>

      <div class="fr-mb-3w" style="display: flex; gap: 0.5rem; flex-wrap: wrap">
        <DsfrBadge :label="`INSEE : ${commune.code}`" type="info" no-icon />
        <DsfrBadge :label="`Département ${commune.codeDepartement}`" type="info" no-icon />
        <DsfrBadge :label="`Région ${commune.codeRegion}`" type="info" no-icon />
      </div>

      <div v-if="population" class="fr-grid-row fr-grid-row--gutters fr-mb-6w">
        <div class="fr-col-12 fr-col-sm-6">
          <DsfrHighlight color="purple-glycine">
            <p class="fr-text--sm fr-mb-0">Population municipale ({{ population.year }})</p>
            <p class="fr-text--bold fr-mb-0" style="font-size: 1.75rem">
              {{ population.pmun.toLocaleString('fr-FR') }}
            </p>
          </DsfrHighlight>
        </div>
        <div class="fr-col-12 fr-col-sm-6">
          <DsfrHighlight color="blue-cumulus">
            <p class="fr-text--sm fr-mb-0">Population totale ({{ population.year }})</p>
            <p class="fr-text--bold fr-mb-0" style="font-size: 1.75rem">
              {{ population.ptot.toLocaleString('fr-FR') }}
            </p>
          </DsfrHighlight>
        </div>
      </div>

      <!-- Datasets -->
      <h2>Jeux de données data.gouv.fr</h2>

      <div v-if="orgsLoading">Chargement…</div>

      <p v-else-if="orgs.length === 0" class="fr-text-mention--grey">
        Aucune organisation data.gouv.fr trouvée pour cette commune.
      </p>

      <template v-else>
        <section v-for="org in orgs" :key="org.id" class="fr-mb-6w">
          <h3>{{ org.name }}</h3>

          <div v-if="org.datasetsLoading">Chargement…</div>

          <p v-else-if="org.datasets.length === 0" class="fr-text-mention--grey">
            Aucun jeu de données.
          </p>

          <template v-else>
            <ul class="fr-raw-list">
              <li
                v-for="ds in pagedDatasets(org)"
                :key="ds.id"
                class="fr-py-1w"
                style="border-bottom: 1px solid var(--border-default-grey)"
              >
                <a :href="ds.page" target="_blank" rel="noopener" class="fr-link">
                  {{ ds.title }}
                </a>
              </li>
            </ul>

            <DsfrPagination
              v-if="pageCount(org) > 1"
              class="fr-mt-2w"
              :pages="pages(org)"
              :current-page="org.currentPage"
              @update:current-page="org.currentPage = $event"
            />
          </template>
        </section>
      </template>
    </template>

    <DsfrAlert
      v-else
      type="error"
      title="Commune introuvable"
      :description="`Aucune commune avec le code ${code}.`"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const PAGE_SIZE = 10

interface Commune {
  nom: string
  code: string
  codeDepartement: string
  codeRegion: string
}

interface Population {
  year: string
  pmun: number
  ptot: number
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
  currentPage: number
}

const route = useRoute()
const code = route.params.code as string
const commune = ref<Commune | null>(null)
const population = ref<Population | null>(null)
const loading = ref(true)
const orgs = ref<Org[]>([])
const orgsLoading = ref(false)

onMounted(async () => {
  try {
    const [communeRes, popRes] = await Promise.all([
      fetch(`https://geo.api.gouv.fr/communes/${code}?fields=nom,code,codeDepartement,codeRegion`),
      fetch(`https://api.insee.fr/melodi/data/DS_POPULATIONS_REFERENCE?GEO=COM-${code}`, {
        headers: { accept: 'application/json' },
      }),
    ])

    if (communeRes.ok) commune.value = await communeRes.json()

    if (popRes.ok) {
      const popJson = await popRes.json()
      population.value = parsePopulation(popJson.observations)
    }
  } finally {
    loading.value = false
  }

  if (commune.value) fetchOrgs()
})

function parsePopulation(observations: any[]): Population | null {
  const byYear: Record<string, Partial<Population>> = {}

  for (const obs of observations) {
    const year: string = obs.dimensions.TIME_PERIOD
    const measure: string = obs.dimensions.POPREF_MEASURE
    const value: number = obs.measures.OBS_VALUE_NIVEAU.value

    if (!byYear[year]) byYear[year] = { year }
    if (measure === 'PMUN') byYear[year].pmun = value
    if (measure === 'PTOT') byYear[year].ptot = value
  }

  const latest = Object.keys(byYear).sort().at(-1)
  if (!latest) return null

  const entry = byYear[latest]
  if (entry.pmun == null || entry.ptot == null) return null
  return entry as Population
}

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
      currentPage: 0,
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

function pageCount(org: Org) {
  return Math.ceil(org.datasets.length / PAGE_SIZE)
}

function pages(org: Org) {
  return Array.from({ length: pageCount(org) }, (_, i) => ({
    label: String(i + 1),
    title: `Page ${i + 1}`,
    href: '#',
  }))
}

function pagedDatasets(org: Org) {
  const start = org.currentPage * PAGE_SIZE
  return org.datasets.slice(start, start + PAGE_SIZE)
}
</script>
