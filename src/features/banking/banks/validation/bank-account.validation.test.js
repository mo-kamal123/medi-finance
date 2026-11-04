import assert from 'node:assert/strict';
import test from 'node:test';
import { bankAccountSchema, createBankAccountSchema } from './bank-account.validation.js';

const validAccount = {
  accountNumber: '123456789', branch: 'فرع القاهرة', iban: '',
  currencyID: '1', openingBalance: 50000, accountType: '1',
  isActive: true, isDefault: false,
};

test('creation converts the account type to a number and defaults to debit', () => {
  const parsed = createBankAccountSchema.parse(validAccount);
  assert.equal(parsed.accountType, 1);
  assert.equal(parsed.isOpeningBalanceDebit, true);
  assert.equal(parsed.openingBalance, 50000);
});

test('creation preserves credit as false and rejects string booleans', () => {
  const parsed = createBankAccountSchema.parse({ ...validAccount, isOpeningBalanceDebit: false });
  assert.equal(parsed.isOpeningBalanceDebit, false);
  assert.equal(
    createBankAccountSchema.safeParse({ ...validAccount, isOpeningBalanceDebit: 'false' }).success,
    false
  );
});

test('creation requires a positive integer account type', () => {
  for (const accountType of ['', undefined, null, 0, -1, 1.5, 'invalid']) {
    assert.equal(createBankAccountSchema.safeParse({ ...validAccount, accountType }).success, false);
  }
});

test('editing does not require the creation-only fields', () => {
  const existingAccount = { ...validAccount };
  delete existingAccount.accountType;
  assert.ok(bankAccountSchema.safeParse(existingAccount).success);
});
