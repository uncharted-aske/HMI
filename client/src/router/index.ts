import { VueConstructor } from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home/Home.vue';
import NotFound from '@/views/NotFound/NotFound.vue';
import BioView from '@/views/Graphs/views/Bio/Bio.vue';
import EpiView from '@/views/Graphs/views/Epi/Epi.vue';
import ComparisonView from '@/views/Graphs/views/Comparison/Comparison.vue';
import Knowledge from '@/views/Graphs/views/Knowledge/Knowledge.vue';

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
        {
          path: '/comparisonView',
          name: 'comparisonView',
          component: ComparisonView,
        }, {
          path: '/knowledge',
          name: 'knowledge',
          component: Knowledge,
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
