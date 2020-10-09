import Vue, { VNode } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faExclamationTriangle, faTimes, faFilter, faInfo, faBook, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
import { createRouter } from './router';
import { store } from './store';

library.add(faExclamationTriangle, faTimes, faFilter, faInfo, faBook, faChartLine);

Vue.component('font-awesome-icon', FontAwesomeIcon);
// Vue.config.productionTip = false

async function main (): Promise<void> {
  const app = new Vue({
    router: createRouter(Vue),
    store,
    render: (h: any): VNode => h(App),
  });
  app.$mount('body');
}

main();
