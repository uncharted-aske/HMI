import { createLocalVue } from '@vue/test-utils';
import Router from '../src/router';

describe('router.spec', function () {
  it('registers the router', function () {
    const localVue = createLocalVue();

    chai.expect('$route' in localVue.prototype).to.equal(false);
    chai.expect('$router' in localVue.prototype).to.equal(false);

    Router.getRouter(localVue);

    chai.expect('$route' in localVue.prototype).to.equal(true);
    chai.expect('$router' in localVue.prototype).to.equal(true);
  });
});
