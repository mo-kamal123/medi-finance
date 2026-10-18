import assert from 'node:assert/strict';
import test from 'node:test';
import { PAYMENT_MODE_OPTIONS, payInvoiceSchema, buildPaymentPayload } from './pay-invoice-utils.js';

const common = {
  amount: '125.50',
  paymentDate: '2026-10-18',
  dueDate: '2026-11-01',
};

test('cheque payment includes due date and only the cheque banking fields', () => {
  const form = payInvoiceSchema.parse({
    ...common, paymentMode: '1', bankID: '5', bankAccountID: '12', checkNumber: 'CH-42',
    fromBankAccountID: '99', toBankAccountID: '100',
  });
  assert.deepEqual(buildPaymentPayload(form), {
    amount: 125.5, paymentMode: 'Check', paymentMethodID: null,
    paymentDate: '2026-10-18T00:00:00', dueDate: '2026-11-01T00:00:00',
    bankID: 5, bankAccountID: 12, checkNumber: 'CH-42',
    fromBankAccountID: null, toBankAccountID: null,
  });
});

test('transfer payment clears stale cheque fields and sends numeric account IDs', () => {
  const form = payInvoiceSchema.parse({
    ...common, paymentMode: '3', fromBankAccountID: '12', toBankAccountID: '24',
    bankID: '5', bankAccountID: '12', checkNumber: 'OLD',
  });
  assert.deepEqual(buildPaymentPayload(form), {
    amount: 125.5, paymentMode: 'BankTransfer', paymentMethodID: null,
    paymentDate: '2026-10-18T00:00:00', dueDate: '2026-11-01T00:00:00',
    bankID: null, bankAccountID: null, checkNumber: null,
    fromBankAccountID: 12, toBankAccountID: 24,
  });
});

test('cash and unsupported payment modes are rejected', () => {
  assert.deepEqual(PAYMENT_MODE_OPTIONS.map(({ value }) => value), ['1', '3']);
  for (const paymentMode of ['2', '', 'Cash', 'unknown']) {
    assert.equal(payInvoiceSchema.safeParse({ ...common, paymentMode }).success, false);
  }
});

test('invalid dates, nonpositive amounts, and incomplete banking details are rejected', () => {
  const transfer = { ...common, paymentMode: '3', fromBankAccountID: '12', toBankAccountID: '24' };
  for (const dueDate of ['', '2026-02-30', '2026-11']) {
    assert.equal(payInvoiceSchema.safeParse({ ...transfer, dueDate }).success, false);
  }
  for (const amount of ['', '0', '-1', 'Infinity', 'abc']) {
    assert.equal(payInvoiceSchema.safeParse({ ...transfer, amount }).success, false);
  }
  for (const changes of [{ fromBankAccountID: '' }, { toBankAccountID: '' }, { toBankAccountID: '12' }, { paymentDate: '' }]) {
    assert.equal(payInvoiceSchema.safeParse({ ...transfer, ...changes }).success, false);
  }
  const cheque = { ...common, paymentMode: '1', bankID: '5', bankAccountID: '12', checkNumber: '42' };
  for (const changes of [{ bankID: '' }, { bankAccountID: '' }, { checkNumber: '   ' }]) {
    assert.equal(payInvoiceSchema.safeParse({ ...cheque, ...changes }).success, false);
  }
});
