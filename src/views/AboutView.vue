<template>
  <div class="fr-container fr-my-6w">
    <DsfrBreadcrumb :links="[{ to: '/', text: 'Accueil' }]" :current-link="{ text: 'À propos' }" />

    <h1>À propos</h1>

    <p class="fr-text--lead">
      Cette application agrège des données ouvertes issues de plusieurs sources nationales
      pour offrir une vue d'ensemble des données disponibles sur une commune française.
    </p>

    <h2>Méthode</h2>

    <h3>Recherche d'une commune</h3>
    <p>
      La recherche de commune s'appuie sur l'API <strong>geo.api.gouv.fr</strong>, qui expose
      le référentiel géographique officiel des communes françaises. La recherche est effectuée
      par nom, avec un boost sur la population pour faire remonter les grandes villes en premier.
      Le code INSEE est utilisé comme identifiant unique pour toutes les requêtes suivantes.
    </p>

    <h3>Informations générales et population</h3>
    <p>
      Les données administratives de la commune (département, région) proviennent de
      <strong>geo.api.gouv.fr</strong>. Les chiffres de population (municipale et totale)
      sont issus de l'<strong>API Mélodi de l'INSEE</strong> (jeu de données
      <code>DS_POPULATIONS_REFERENCE</code>), qui publie les populations de référence
      millésimées. Seule l'année la plus récente disponible est affichée.
    </p>

    <h3>Jeux de données des organisations data.gouv.fr</h3>
    <p>
      Un <a href="https://www.data.gouv.fr/datasets/liste-des-mairies-sur-data-gouv-fr" target="_blank" rel="noopener" class="fr-link">référentiel des mairies présentes sur data.gouv.fr</a> est interrogé via l'
      <strong>API tabulaire de data.gouv.fr</strong> (ressource
      <code>9ce1f9d6-5924-4f28-9cc0-b53d12073d6f</code>), filtré par code INSEE.
      Pour chaque organisation trouvée, les jeux de données sont récupérés via
      <code>/api/2/datasets/search?organization=…</code>, triés par pertinence.
    </p>

    <h3>Base de données référençant la commune</h3>
    <p>
      Un <a href="https://www.data.gouv.fr/datasets/hackathon-ign-donnees-tabulaires-avec-code-commune?resource_id=ce3d9c4e-9c24-4ac3-a064-7a2d59c44a10" target="_blank" rel="noopener" class="fr-link">index des ressources tabulaires comportant une colonne commune</a> est interrogeable
      via l'<strong>API tabulaire</strong> (ressource <code>ce3d9c4e-9c24-4ac3-a064-7a2d59c44a10</code>).
      La recherche porte sur le titre du jeu de données. Une fois une ressource sélectionnée,
      les lignes correspondant à la commune sont extraites en filtrant sur la colonne
      identifiée (<code>{col_commune}__exact={code_insee}</code>). Un lien vers
      l'<strong>explorateur data.gouv.fr</strong> pré-filtré est proposé pour aller plus loin.
    </p>

    <h3>Jeux de données couvrant géographiquement la commune</h3>
    <p>
      Les jeux de données référencés sur le territoire de la commune sont récupérés via
      l'endpoint <strong>spatial.zones</strong> de l'API data.gouv.fr
      (<code>/api/1/spatial/zone/fr:commune:{code}/datasets/</code>).
      Ce mécanisme retourne les jeux de données dont l'emprise géographique déclarée
      couvre la commune.
    </p>
    <p>
      Une intégration via <strong>spatial.geom</strong> est prévue, permettant une
      couverture géographique plus fine basée sur les géométries réelles des jeux de données.
    </p>

    <h2>Sources de données</h2>
    <ul class="fr-raw-list">
      <li class="fr-py-1w" style="border-bottom: 1px solid var(--border-default-grey)">
        <a href="https://geo.api.gouv.fr" target="_blank" rel="noopener" class="fr-link">geo.api.gouv.fr</a>
        — Référentiel géographique des communes
      </li>
      <li class="fr-py-1w" style="border-bottom: 1px solid var(--border-default-grey)">
        <a href="https://api.insee.fr/melodi" target="_blank" rel="noopener" class="fr-link">API Mélodi — INSEE</a>
        — Populations de référence
      </li>
      <li class="fr-py-1w" style="border-bottom: 1px solid var(--border-default-grey)">
        <a href="https://www.data.gouv.fr" target="_blank" rel="noopener" class="fr-link">data.gouv.fr</a>
        — Jeux de données, organisations, zones spatiales
      </li>
      <li class="fr-py-1w">
        <a href="https://tabular-api.data.gouv.fr" target="_blank" rel="noopener" class="fr-link">tabular-api.data.gouv.fr</a>
        — Index et filtrage des ressources tabulaires
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
</script>
