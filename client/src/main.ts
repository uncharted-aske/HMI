import Vue, { VNode } from 'vue';
import { sync } from 'vuex-router-sync';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faArrowsAltH,
  faBan,
  faBook,
  faBookmark,
  faCaretDown,
  faCaretRight,
  faChartLine,
  faCheckCircle,
  faCog,
  faColumns,
  faCompressAlt,
  faExclamationTriangle,
  faExpandAlt,
  faEye,
  faEyeSlash,
  faFilter,
  faInfo,
  faLongArrowAltRight,
  faPause,
  faPlay,
  faProjectDiagram,
  faSearch,
  faSignOutAlt,
  faTimes,
  faTools,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';
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
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faArrowsAltH,
  faBan,
  faBook,
  faBookmark,
  faCaretDown,
  faCaretRight,
  faChartLine,
  faCheckCircle,
  faCog,
  faColumns,
  faCompressAlt,
  faExclamationTriangle,
  faExpandAlt,
  faEye,
  faEyeSlash,
  faFilter,
  faInfo,
  faLongArrowAltRight,
  faPause,
  faPlay,
  faProjectDiagram,
  faSearch,
  faSignOutAlt,
  faTimes,
  faTools,
  faUndo,
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
