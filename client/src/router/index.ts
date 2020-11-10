import { VueConstructor } from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home/index.vue';
import NotFound from '@/views/NotFound/index.vue';
import BioView from '@/views/Bio/index.vue';
import EpiView from '@/views/Epi/index.vue';

const RouterSingleton = ((): any => {
  let router: Router;

  const createRouter = (vue: VueConstructor): Router => {
    vue.use(Router);
    const newRouter = new Router({
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
    return newRouter;
  };

  const getRouter = (vue?: VueConstructor): Router => {
    if (!router) router = createRouter(vue);
    return router;
  };

  return {
    getRouter,
  };
})();

export default RouterSingleton;
