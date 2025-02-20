import Vue, { VNode } from 'vue';
import { sync } from 'vuex-router-sync';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import CapitalizeFirstLetterFormatter from './filters/CapitalizeFirstLetterFormatter';
import UnderscoreRemoverFormatter from './filters/UnderscoreRemoverFormatter';
import RemoveBracesFormatter from './filters/RemoveBracesFormatter';
import CapitalizeFormatter from './filters/CapitalizeFormatter';
import PrecisionFormatter from './filters/PrecisionFormatter';
import ArrayToList from './filters/ArrayToListFormatter';

import App from './App.vue';
import Router from './router';
import { store } from './store';

const router = Router.getRouter(Vue);

// Add sync'd route state to store
sync(store, router);

library.add(
  FA.faAngleDoubleDown,
  FA.faAngleDoubleLeft,
  FA.faAngleDoubleRight,
  FA.faAngleDoubleUp,
  FA.faArrowsAltH,
  FA.faBan,
  FA.faBook,
  FA.faBookmark,
  FA.faCaretDown,
  FA.faCaretRight,
  FA.faChartLine,
  FA.faCheckCircle,
  FA.faCog,
  FA.faColumns,
  FA.faCompressAlt,
  FA.faExclamationTriangle,
  FA.faExpandAlt,
  FA.faEye,
  FA.faEyeSlash,
  FA.faFilter,
  FA.faInfo,
  FA.faLongArrowAltRight,
  FA.faPause,
  FA.faPlay,
  FA.faPlus,
  FA.faProjectDiagram,
  FA.faSearch,
  FA.faSignOutAlt,
  FA.faSpinner,
  FA.faTimes,
  FA.faTools,
  FA.faUndo,
  FA.faWindowMaximize,
  FA.faWindowMinimize,
  FA.faInfoCircle,
  FA.faExclamationTriangle,
);
// Enable automatic font awesome icon transformations
dom.watch();

Vue.component('font-awesome-icon', FontAwesomeIcon);
// Vue.config.productionTip = false

Vue.filter('CapitalizeFirstLetterFormatter', CapitalizeFirstLetterFormatter);
Vue.filter('UnderscoreRemoverFormatter', UnderscoreRemoverFormatter);
Vue.filter('RemoveBracesFormatter', RemoveBracesFormatter);
Vue.filter('CapitalizeFormatter', CapitalizeFormatter);
Vue.filter('PrecisionFormatter', PrecisionFormatter);
Vue.filter('ArrayToList', ArrayToList);

async function main (): Promise<void> {
  const app = new Vue({
    router,
    store,
    render: (h: any): VNode => h(App),
  });
  app.$mount('#app');
}

main();
