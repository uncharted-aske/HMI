import { VueConstructor } from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import NotFound from '@/views/NotFound.vue';
import BioView from '@/views/BioView.vue';
import EpiView from '@/views/EpiView.vue';
import GraphExperiment from '@/views/GraphExperiment.vue';


export function createRouter (vue: VueConstructor): Router {
  vue.use(Router);
  return new Router({
    base: process.env.BASE_URL,
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home,
      },
      {
        path: '/bioView',
        name: 'bioView',
        component: BioView,
      },
      {
        path: '/epiView',
        name: 'epiView',
        component: EpiView,
      },
      {
        path: '/graphExperiment',
        name: 'graphExperiment',
        component: GraphExperiment,
      },
      /* 404, this has to go last */
      {
        path: '*',
        component: NotFound,
      },
    ],
  });
}
