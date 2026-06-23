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

      <!-- Two-column layout -->
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12 fr-col-md-3">
          <DsfrSideMenu
            heading-title="Sur cette page"
            :menu-items="[
              { text: 'Données tabulaires', to: { hash: '#tabular' } },
              { text: 'Données territoriales', to: { hash: '#spatial' } },
              { text: 'Organisations', to: { hash: '#orgs' } },
            ]"
          />
        </div>

        <div class="fr-col-12 fr-col-md-9">
          <!-- Tabular data search -->
          <h2 id="tabular">Données tabulaires</h2>

          <div class="fr-search-bar fr-mb-2w" style="max-width: 560px">
            <input
              v-model="tabularQuery"
              class="fr-input"
              type="search"
              placeholder="Rechercher un jeu de données…"
              autocomplete="off"
              @input="onTabularSearch"
            />
          </div>

          <div v-if="tabularSearchLoading" class="fr-text--sm fr-text-mention--grey fr-mb-2w">Recherche…</div>

          <ul v-else-if="tabularSearchResults.length" class="fr-raw-list fr-mb-3w" style="max-width: 560px">
            <li
              v-for="r in tabularSearchResults"
              :key="r.resourceId"
              class="fr-py-1w fr-px-2w"
              style="border-bottom: 1px solid var(--border-default-grey); cursor: pointer"
              @click="selectTabularResource(r)"
            >
              <span>{{ r.datasetTitle }}</span>
              <span class="fr-text--sm fr-text-mention--grey fr-ml-1w">— {{ r.title }}</span>
            </li>
          </ul>

          <section v-if="tabularSelected" class="fr-mb-6w">
            <h3 class="fr-mb-0">{{ tabularSelected.datasetTitle }}</h3>
            <p class="fr-text--sm fr-text-mention--grey fr-mb-1w">{{ tabularSelected.title }}</p>

            <div v-if="tabularSelected.loading">Chargement…</div>

            <template v-else-if="tabularSelected.total > 0">
              <p class="fr-mb-1w">
                <DsfrBadge :label="`${tabularSelected.total.toLocaleString('fr-FR')} ligne${tabularSelected.total > 1 ? 's' : ''}`" no-icon />
              </p>
              <div class="fr-table fr-table--sm fr-mb-1w" style="overflow-x: auto">
                <table>
                  <thead>
                    <tr>
                      <th v-for="col in Object.keys(tabularSelected.rows[0])" :key="col">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in tabularSelected.rows" :key="i">
                      <td v-for="(val, col) in row" :key="col">{{ val }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <a :href="tabularSelected.previewUrl" target="_blank" rel="noopener" class="fr-link fr-text--sm" style="display: inline-block">
                Voir dans l'explorateur →
              </a>
            </template>

            <p v-else class="fr-text-mention--grey fr-text--sm">Aucune donnée pour cette commune.</p>
          </section>

          <!-- Spatial datasets -->
          <h2 id="spatial">Jeux de données territoriaux</h2>

          <div v-if="spatialLoading">Chargement…</div>

          <p v-else-if="spatialDatasets.length === 0" class="fr-text-mention--grey">
            Aucun jeu de données référencé pour ce territoire.
          </p>

          <template v-else>
            <ul class="fr-raw-list">
              <li
                v-for="ds in pagedSpatial"
                :key="ds.id"
                class="fr-py-1w"
                style="border-bottom: 1px solid var(--border-default-grey)"
              >
                <a :href="ds.page" target="_blank" rel="noopener" class="fr-link">{{ ds.title }}</a>
              </li>
            </ul>
            <DsfrPagination
              v-if="spatialPageCount > 1"
              class="fr-mt-2w"
              :pages="spatialPages"
              :current-page="spatialCurrentPage"
              @update:current-page="spatialCurrentPage = $event"
            />
          </template>

          <!-- Org datasets -->
          <h2 id="orgs" class="fr-mt-6w">Organisations data.gouv.fr</h2>

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
                    v-for="ds in org.datasets"
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
                  @update:current-page="onPageChange(org, $event)"
                />
              </template>
            </section>
          </template>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
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

interface TabularResource {
  resourceId: string
  colCommune: string
  datasetTitle: string
  title: string
  previewUrl: string
  loading: boolean
  total: number
  rows: Record<string, unknown>[]
}

interface Org {
  id: string
  name: string
  siren: string
  datasets: Dataset[]
  datasetsLoading: boolean
  currentPage: number
  total: number
}

const route = useRoute()
const code = route.params.code as string
const commune = ref<Commune | null>(null)
const population = ref<Population | null>(null)
const loading = ref(true)

// Tabular search
const tabularQuery = ref('')
const tabularSearchLoading = ref(false)
const tabularSearchResults = ref<TabularResource[]>([])
const tabularSelected = ref<TabularResource | null>(null)
let tabularDebounce: ReturnType<typeof setTimeout>

// Spatial
const spatialDatasets = ref<Dataset[]>([])
const spatialLoading = ref(false)
const spatialCurrentPage = ref(0)
const spatialPageCount = computed(() => Math.ceil(spatialDatasets.value.length / PAGE_SIZE))
const spatialPages = computed(() =>
  Array.from({ length: spatialPageCount.value }, (_, i) => ({
    label: String(i + 1),
    title: `Page ${i + 1}`,
    href: '#',
  })),
)
const pagedSpatial = computed(() => {
  const start = spatialCurrentPage.value * PAGE_SIZE
  return spatialDatasets.value.slice(start, start + PAGE_SIZE)
})

// Orgs
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

  if (commune.value) {
    fetchSpatialDatasets()
    fetchOrgs()
  }
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

function onTabularSearch() {
  clearTimeout(tabularDebounce)
  tabularSearchResults.value = []
  tabularSelected.value = null
  if (tabularQuery.value.length < 2) return
  tabularDebounce = setTimeout(searchTabular, 300)
}

async function searchTabular() {
  tabularSearchLoading.value = true
  try {
    const res = await fetch(
      `https://tabular-api.data.gouv.fr/api/resources/ce3d9c4e-9c24-4ac3-a064-7a2d59c44a10/data/?dataset.title__contains=${encodeURIComponent(tabularQuery.value)}&page_size=10`,
    )
    const json = await res.json()
    tabularSearchResults.value = json.data.map((row: any) => ({
      resourceId: row.resource_id,
      colCommune: row.col_commune,
      datasetTitle: row['dataset.title'],
      title: row.title,
      previewUrl: row.preview_url,
      loading: false,
      total: 0,
      rows: [],
    }))
  } finally {
    tabularSearchLoading.value = false
  }
}

async function selectTabularResource(r: TabularResource) {
  tabularSearchResults.value = []
  tabularQuery.value = ''
  tabularSelected.value = { ...r, loading: true }

  try {
    const filter = `${encodeURIComponent(r.colCommune)}__exact=${code}`
    const res = await fetch(
      `https://tabular-api.data.gouv.fr/api/resources/${r.resourceId}/data/?${filter}&page_size=5`,
    )
    const json = await res.json()
    tabularSelected.value.total = json.meta.total
    tabularSelected.value.rows = json.data.map(({ __id, ...rest }: any) => rest)
  } catch {
    tabularSelected.value.total = 0
  } finally {
    tabularSelected.value.loading = false
  }
}

async function fetchSpatialDatasets() {
  spatialLoading.value = true
  try {
    const res = await fetch(
      `https://www.data.gouv.fr/api/1/spatial/zone/fr:commune:${code}/datasets/`,
    )
    if (res.ok) {
      const json = await res.json()
      spatialDatasets.value = json.map((ds: any) => ({ id: ds.id, title: ds.title, page: ds.page }))
    }
  } finally {
    spatialLoading.value = false
  }
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
      total: 0,
    }))
  } finally {
    orgsLoading.value = false
  }

  orgs.value.forEach(fetchDatasets)
}

async function fetchDatasets(org: Org, page = 1) {
  org.datasetsLoading = true
  try {
    const res = await fetch(
      `https://www.data.gouv.fr/api/2/datasets/search/?organization=${org.id}&page=${page}&page_size=${PAGE_SIZE}`,
    )
    const json = await res.json()
    org.datasets = json.data.map((ds: any) => ({ id: ds.id, title: ds.title, page: ds.page }))
    org.total = json.total
  } finally {
    org.datasetsLoading = false
  }
}

function pageCount(org: Org) {
  return Math.ceil(org.total / PAGE_SIZE)
}

function pages(org: Org) {
  return Array.from({ length: pageCount(org) }, (_, i) => ({
    label: String(i + 1),
    title: `Page ${i + 1}`,
    href: '#',
  }))
}

async function onPageChange(org: Org, page: number) {
  org.currentPage = page
  await fetchDatasets(org, page + 1)
}
</script>
