<template>
  <div ref="mapEl" style="width: 100%; height: 400px; border-radius: 4px" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import { mapStyles } from 'carte-facile'
import 'maplibre-gl/dist/maplibre-gl.css'
import 'carte-facile/carte-facile.css'

const props = defineProps<{
  contour: GeoJSON.Geometry
}>()

const mapEl = ref<HTMLElement>()
let map: maplibregl.Map

onMounted(() => {
  map = new maplibregl.Map({
    container: mapEl.value!,
    style: mapStyles.simple,
    attributionControl: false,
    scrollZoom: false,
    boxZoom: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
    dragRotate: false,
  })

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', () => {
    map.addSource('commune', { type: 'geojson', data: props.contour as GeoJSON.GeoJSON })

    map.addLayer({
      id: 'commune-fill',
      type: 'fill',
      source: 'commune',
      paint: { 'fill-color': '#0063cb', 'fill-opacity': 0.15 },
    })

    map.addLayer({
      id: 'commune-outline',
      type: 'line',
      source: 'commune',
      paint: { 'line-color': '#0063cb', 'line-width': 2 },
    })

    const bounds = getBounds(props.contour)
    map.fitBounds(bounds, { padding: 40, maxZoom: 14 })
  })
})

onUnmounted(() => map?.remove())

function getBounds(geometry: GeoJSON.Geometry): maplibregl.LngLatBoundsLike {
  const coords: [number, number][] =
    geometry.type === 'Polygon'
      ? (geometry.coordinates.flat() as [number, number][])
      : geometry.type === 'MultiPolygon'
        ? (geometry.coordinates.flat(2) as [number, number][])
        : []

  const lngs = coords.map(([lng]) => lng)
  const lats = coords.map(([, lat]) => lat)
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}
</script>
