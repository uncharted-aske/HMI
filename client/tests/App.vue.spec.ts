// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../src/vue-shims.d.ts" />
import { mount, createLocalVue } from '@vue/test-utils';
import { createRouter } from '../src/router';
import App from '../src/App.vue';

describe('App.vue.spec', function () {
  let localVue;
  let router;
  let wrapper;

  before(async function () {
    localVue = createLocalVue();
    router = createRouter(localVue);
    wrapper = mount(App, {
      localVue,
      router,
    });
  });

  it('renders', function () {
    chai.expect(wrapper.html()).to.not.contain('router-view');
  });

  it('sets the route to "home"', function () {
    chai.expect(wrapper.vm.$route.name).to.equal('home');
  });
});
