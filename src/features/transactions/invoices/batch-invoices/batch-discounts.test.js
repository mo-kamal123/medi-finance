import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeDiscountRows, buildFinanceDiscountPayload, updateFinanceDiscount } from './batch-discounts.js';

test('ineligible batches have no discount rows or submitted discounts, including stale edits', () => {
  assert.deepEqual(initializeDiscountRows({ medicalDiscount: 100 }, false), []);
  const rows = initializeDiscountRows({ medicalDiscount: 100 }, true)
    .map((row) => row.isFinance ? updateFinanceDiscount(row, 'percentage', '5', { netAmount: 600 }) : row);
  assert.deepEqual(buildFinanceDiscountPayload(rows, false), []);
});

test('eligible batches retain batch discounts and editable finance discounts', () => {
  const rows = initializeDiscountRows({ medicalDiscount: 100 }, true);
  assert.equal(rows.length, 6);
  assert.equal(rows[0].amount, 100);
  const financeRows = rows.filter((row) => row.isFinance)
    .map((row) => updateFinanceDiscount(row, 'percentage', row.type === 1 ? '5' : '3', { netAmount: 600 }));
  assert.equal(financeRows.reduce((sum, row) => sum + row.amount, 0), 48);
  assert.deepEqual(buildFinanceDiscountPayload(financeRows, true), [
    { name: 'مصاريف إدارية', type: 1, percentage: 5, source: 1 },
    { name: 'خصم منبع', type: 2, percentage: 3, source: 1 },
  ]);
});

test('older responses without the eligibility flag keep existing behavior', () => {
  assert.deepEqual(initializeDiscountRows({}), initializeDiscountRows({}, true));
  const rows = initializeDiscountRows({});
  assert.deepEqual(buildFinanceDiscountPayload(rows), buildFinanceDiscountPayload(rows, true));
});
