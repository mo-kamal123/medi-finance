import assert from 'node:assert/strict';
import test from 'node:test';
import { bankAccountSchema, createBankAccountSchema } from './bank-account.validation.js';

const validAccount = {
  accountNumber: '123456789', branch: 'فرع القاهرة', iban: '',
  currencyID: '1', openingBalance: 50000, accountType: '1', accountKind: '1',
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

test('branch is optional for both new and existing accounts', () => {
  for (const schema of [bankAccountSchema, createBankAccountSchema]) {
    for (const branch of ['', '   ', undefined]) {
      assert.equal(schema.parse({ ...validAccount, branch }).branch, '');
    }
  }
});

test('account kind accepts lookup IDs and converts them to numeric payload values', () => {
  for (const accountKind of ['1', '2', 1, 2]) {
    assert.equal(createBankAccountSchema.parse({ ...validAccount, accountKind }).accountKind, Number(accountKind));
  }
  for (const accountKind of ['', undefined, null, 0, 3, 1.5, 'invalid']) {
    assert.equal(createBankAccountSchema.safeParse({ ...validAccount, accountKind }).success, false);
  }
});
