import Vue, { VNode } from 'vue';
import App from './App.vue';

async function main (): Promise<void> {
  const app = new Vue({
    render: (h: any): VNode => h(App),
  });
  app.$mount('body');
}

main();
