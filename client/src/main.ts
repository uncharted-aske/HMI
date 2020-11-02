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
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
import router from './router';
import { store } from './store';

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
);
// Enable automatic font awesome icon transformations
dom.watch();

Vue.component('font-awesome-icon', FontAwesomeIcon);
// Vue.config.productionTip = false

async function main (): Promise<void> {
  const app = new Vue({
    router,
    store,
    render: (h: any): VNode => h(App),
  });
  app.$mount('#app');
}

main();
