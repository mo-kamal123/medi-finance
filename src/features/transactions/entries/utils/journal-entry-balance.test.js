import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateJournalEntryBalance } from './journal-entry-balance.js';
import { journalEntrySchema } from '../validation/journal-entry.validation.js';

const form = (details) => ({
  entryDate: '2026-11-23',
  journalType: 'DailyEntry',
  financialPeriodID: '4',
  statusID: '0',
  details: details.map((row, index) => ({
    rowKey: String(index),
    accountID: '7105',
    ...row,
  })),
});

test('decimal addition balances when raw floating point totals differ', () => {
  const details = [
    { debitAmount: '0.1' },
    { debitAmount: '0.2' },
    { creditAmount: '0.3' },
  ];
  assert.notEqual(0.1 + 0.2, 0.3);
  assert.deepEqual(calculateJournalEntryBalance(details), {
    totalDebit: 0.3,
    totalCredit: 0.3,
    isBalanced: true,
  });
  assert.equal(journalEntrySchema.safeParse(form(details)).success, true);
});

test('the reported total balances at displayed precision', () => {
  const details = [
    { debitAmount: '50000.10' },
    { debitAmount: '8975.89' },
    { creditAmount: '58975.99' },
  ];
  assert.deepEqual(calculateJournalEntryBalance(details), {
    totalDebit: 58975.99,
    totalCredit: 58975.99,
    isBalanced: true,
  });
  assert.equal(journalEntrySchema.safeParse(form(details)).success, true);
});

test('one-cent differences, zero totals and nonfinite totals are rejected', () => {
  for (const details of [
    [],
    [{ debitAmount: '0', creditAmount: '0' }],
    [{ debitAmount: '58975.98' }, { creditAmount: '58975.99' }],
    [{ debitAmount: 'Infinity' }, { creditAmount: 'Infinity' }],
  ]) {
    assert.equal(calculateJournalEntryBalance(details).isBalanced, false);
    assert.equal(journalEntrySchema.safeParse(form(details)).success, false);
  }
});

test('balanced totals still require an account on each line and required header fields', () => {
  const data = form([{ debitAmount: '100' }, { creditAmount: '100' }]);
  assert.equal(journalEntrySchema.safeParse(data).success, true);
  assert.equal(
    journalEntrySchema.safeParse({ ...data, financialPeriodID: '' }).success,
    false
  );
  data.details[0].accountID = '';
  assert.equal(journalEntrySchema.safeParse(data).success, false);
});
