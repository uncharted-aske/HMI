import { VueConstructor } from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home/Home.vue';
import NotFound from '@/views/NotFound/NotFound.vue';
import GraphExperiment from '@/views/GraphExperiment/GraphExperiment.vue';
import Graph from '@/views/Graphs/Graph.vue';
import GraphsList from '@/views/Graphs/GraphsList.vue';
import Model from '@/views/Models/Model.vue';
import ModelsList from '@/views/Models/ModelsList.vue';
import Simulation from '@/views/Simulation/Simulation.vue';
import Comparison from '@/views/Comparison/Comparison.vue';
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
          path: '/graphExperiment',
          name: 'graphExperiment',
          component: GraphExperiment,
        },
        {
          path: '/graphs',
          name: 'graphs',
          component: GraphsList,
        },
        {
          path: '/graph/:model_id',
          name: 'graph',
          component: Graph,
        },
        {
          path: '/models',
          name: 'models',
          component: ModelsList,
        },
        {
          path: '/model/:model_id',
          name: 'model',
          component: Model,
        },
        {
          path: '/simulation/:model_ids',
          name: 'simulation',
          component: Simulation,
        },
        {
          path: '/comparison/:model_ids',
          name: 'comparison',
          component: Comparison,
        },
        {
          path: '/knowledge/docsCards',
          name: 'docsCards',
          component: DocsCards,
        },
        {
          path: '/knowledge/docsClusters',
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
