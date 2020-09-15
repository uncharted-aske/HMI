import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import NotFound from '@/views/NotFound.vue'
import BioView from '@/views/BioView.vue'
import EpiView from '@/views/EpiView.vue'

Vue.use(Router)

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/',
      name: 'bioView',
      component: BioView
    },
    {
      path: '/',
      name: 'epiView',
      component: EpiView
    },
    /* 404, this has to go last */
    {
      path: '*',
      component: NotFound
    }
  ]
})
