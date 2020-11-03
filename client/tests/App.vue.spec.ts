// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../src/vue-shims.d.ts" />
import { mount, createLocalVue } from '@vue/test-utils';
import { sync } from 'vuex-router-sync';
import { createRouter } from '../src/router';
import { store } from '../src/store';
import App from '../src/App.vue';

describe('App.vue.spec', function () {
  let localVue;
  let router;
  let wrapper;

  before(async function () {
    localVue = createLocalVue();
    router = createRouter(localVue);
    sync(store, router);
    wrapper = mount(App, {
      localVue,
      router,
      store,
    });
  });

  it('renders', function () {
    chai.expect(wrapper.html()).to.not.contain('router-view');
  });

  it('sets the route to "home"', function () {
    chai.expect(wrapper.vm.$route.name).to.equal('home');
  });
});
