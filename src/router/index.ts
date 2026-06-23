import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CommuneView from '../views/CommuneView.vue'

export default createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
  },
  routes: [
    { path: '/', component: HomeView },
    { path: '/communes/:code', component: CommuneView },
  ],
})
