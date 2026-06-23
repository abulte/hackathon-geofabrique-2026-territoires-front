<template>
  <div class="fr-container fr-my-6w">
    <h1>Rechercher une commune</h1>

    <div class="fr-search-bar fr-mb-2w" style="max-width: 480px">
      <input
        v-model="query"
        class="fr-input"
        type="search"
        placeholder="Nom de la commune…"
        aria-label="Nom de la commune"
        autocomplete="off"
        @input="onInput"
      />
    </div>

    <div v-if="loading" class="fr-text--sm fr-text-mention--grey">Recherche…</div>

    <ul v-if="results.length" class="fr-raw-list" style="max-width: 480px">
      <li
        v-for="c in results"
        :key="c.code"
        class="fr-py-1w fr-px-2w"
        style="border-bottom: 1px solid var(--border-default-grey); cursor: pointer"
        @click="go(c.code)"
      >
        <strong>{{ c.nom }}</strong>
        <span class="fr-text--sm fr-text-mention--grey fr-ml-1w">({{ c.codeDepartement }})</span>
      </li>
    </ul>

    <p v-if="!loading && query.length >= 2 && results.length === 0" class="fr-text-mention--grey">
      Aucun résultat.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Commune {
  nom: string
  code: string
  codeDepartement: string
}

const query = ref('')
const results = ref<Commune[]>([])
const loading = ref(false)
const router = useRouter()

let debounceTimer: ReturnType<typeof setTimeout>

function onInput() {
  clearTimeout(debounceTimer)
  results.value = []
  if (query.value.length < 2) return
  debounceTimer = setTimeout(search, 300)
}

async function search() {
  loading.value = true
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query.value)}&fields=nom,code,codeDepartement&boost=population&limit=10`,
    )
    results.value = await res.json()
  } finally {
    loading.value = false
  }
}

function go(code: string) {
  router.push(`/communes/${code}`)
}
</script>
