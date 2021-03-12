import { VueConstructor } from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home/Home.vue';
import NotFound from '@/views/NotFound/NotFound.vue';
import Bio from '@/views/Models/Bio/Bio.vue';
import Epi from '@/views/Models/Epi/Epi.vue';
import Comparison from '@/views/Models/Comparison/Comparison.vue';
import DocsCards from '@/views/Knowledge/DocsCards/DocsCards.vue';
import DocsClusters from '@/views/Knowledge/DocsClusters/DocsClusters.vue';

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
          path: '/bio',
          name: 'bio',
          component: Bio,
        },
        {
          path: '/epi',
          name: 'epi',
          component: Epi,
        },
        {
          path: '/comparison',
          name: 'comparison',
          component: Comparison,
        }, {
          path: '/docsCards',
          name: 'docsCards',
          component: DocsCards,
        }, {
          path: '/docsClusters',
          name: 'docsClusters',
          component: DocsClusters,
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
