import assert from 'node:assert/strict';
import test from 'node:test';
import { bankAccountSchema, createBankAccountSchema } from './bank-account.validation.js';

const validAccount = {
  accountNumber: '123456789', branch: 'فرع القاهرة', iban: '',
  currencyID: '1', openingBalance: 50000, accountType: '1',
  counterpartAccountID: '301', isActive: true, isDefault: false,
};

test('creation converts selected account type and counterpart IDs to numbers', () => {
  const parsed = createBankAccountSchema.parse(validAccount);
  assert.equal(parsed.accountType, 1);
  assert.equal(parsed.counterpartAccountID, 301);
  assert.equal(parsed.openingBalance, 50000);
});

test('creation requires positive integer account type and counterpart IDs', () => {
  for (const field of ['accountType', 'counterpartAccountID']) {
    for (const value of ['', undefined, null, 0, -1, 1.5, 'invalid']) {
      assert.equal(createBankAccountSchema.safeParse({ ...validAccount, [field]: value }).success, false, field + ': ' + value);
    }
  }
});

test('editing does not require the creation-only fields', () => {
  const existingAccount = { ...validAccount };
  delete existingAccount.accountType;
  delete existingAccount.counterpartAccountID;
  assert.ok(bankAccountSchema.safeParse(existingAccount).success);
});
