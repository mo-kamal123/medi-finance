import assert from 'node:assert/strict';
import test from 'node:test';
import { canViewRoute, filterNavigation } from './route-permissions.js';

test('general invoice routes require the existing invoice view permission', () => {
  for (const route of ['/general-invoices', '/general-invoices/new']) {
    assert.equal(canViewRoute({ Invoices: { View: true } }, route), true);
    assert.equal(canViewRoute({ Invoices: { View: false } }, route), false);
    assert.equal(canViewRoute({}, route), false);
    assert.equal(canViewRoute(undefined, route), false);
    assert.equal(canViewRoute({ Customers: { View: true } }, route), false);
  }
});

test('general invoices remain in the sidebar only with invoice view permission', () => {
  const items = [{ name: 'Accounting', sub: [{ name: 'Invoices', sub: [
    { name: 'General invoices', link: '/general-invoices' },
  ] }] }];
  assert.deepEqual(filterNavigation(items, { Invoices: { View: true } }), items);
  assert.deepEqual(filterNavigation(items, { Invoices: { View: false } }), []);
});
