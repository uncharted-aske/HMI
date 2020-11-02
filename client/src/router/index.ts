import { VueConstructor } from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import NotFound from '@/views/NotFound.vue';
import BioView from '@/views/BioView.vue';
import EpiView from '@/views/EpiView.vue';

let router: Router;

const createRouter = (vue: VueConstructor): Router => {
  vue.use(Router);
  router = new Router({
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
      /* 404, this has to go last */
      {
        path: '*',
        component: NotFound,
      },
    ],
  });
  return router;
};

const getRouter = (): Router => {
  return router;
};

export {
  createRouter,
  getRouter,
};
