import Vue, { VNode } from 'vue';
import { sync } from 'vuex-router-sync';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faExclamationTriangle,
  faTimes,
  faFilter,
  faInfo,
  faBook,
  faChartLine,
  faSearch,
  faAngleDoubleRight,
  faAngleDoubleLeft,
  faArrowsAltH,
  faCaretDown,
  faCaretRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import CapitalizeFirstLetterFormatter from './filters/CapitalizeFirstLetterFormatter';
import UnderscoreRemoverFormatter from './filters/UnderscoreRemoverFormatter';
import RemoveBracesFormatter from './filters/RemoveBracesFormatter';

import App from './App.vue';
import Router from './router';
import { store } from './store';

const router = Router.getRouter(Vue);

// Add sync'd route state to store
sync(store, router);

library.add(
  faExclamationTriangle,
  faTimes,
  faFilter,
  faInfo,
  faBook,
  faChartLine,
  faSearch,
  faAngleDoubleRight,
  faAngleDoubleLeft,
  faArrowsAltH,
  faCaretDown,
  faCaretRight,
);
// Enable automatic font awesome icon transformations
dom.watch();

Vue.component('font-awesome-icon', FontAwesomeIcon);
// Vue.config.productionTip = false

Vue.filter('CapitalizeFirstLetterFormatter', CapitalizeFirstLetterFormatter);
Vue.filter('UnderscoreRemoverFormatter', UnderscoreRemoverFormatter);
Vue.filter('RemoveBracesFormatter', RemoveBracesFormatter);

async function main (): Promise<void> {
  const app = new Vue({
    router,
    store,
    render: (h: any): VNode => h(App),
  });
  app.$mount('#app');
}

main();
