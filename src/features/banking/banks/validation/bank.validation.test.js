import assert from 'node:assert/strict';
import test from 'node:test';
import { bankSchema } from './bank.validation.js';

const validBank = { bankCode: '001', bankNameAr: 'البنك الأهلي' };
const isValid = (values) => bankSchema.safeParse({ ...validBank, ...values }).success;

test('bank code and Arabic name are required and language rules are enforced', () => {
  assert.ok(isValid({}));
  assert.ok(!isValid({ bankCode: '   ' }));
  assert.ok(!isValid({ bankNameAr: '   ' }));
  assert.ok(!isValid({ bankNameAr: 'National Bank' }));
  assert.ok(isValid({ bankNameEn: 'National Bank' }));
  assert.ok(!isValid({ bankNameEn: 'البنك الأهلي' }));
});

test('hotline accepts 3 to 6 digits and rejects mobile numbers and non-digit input', () => {
  for (const phone of ['123', '1234', '19623', '123456', ' 19623 ']) {
    assert.ok(isValid({ phone }), phone);
  }
  for (const phone of ['12', '1234567', '01012345678', '+2019623', '19-623', 'abcde', '1e5']) {
    assert.ok(!isValid({ phone }), phone);
  }
  assert.equal(bankSchema.parse({ ...validBank, phone: ' 19623 ' }).phone, '19623');
});

test('optional fields accept empty, whitespace, null, and omitted values', () => {
  for (const field of ['phone', 'email', 'website', 'swiftCode', 'bankNameEn']) {
    for (const value of ['', '   ', null, undefined]) {
      assert.ok(isValid({ [field]: value }), field);
    }
  }
});

test('email, website, and SWIFT reject invalid values and accept valid input', () => {
  assert.ok(isValid({ email: ' info@bank.com ', website: 'https://www.bank.com', swiftCode: 'NBEGEGCX' }));
  assert.ok(isValid({ website: 'www.bank.com', swiftCode: 'NBEGEGCXXXX' }));
  assert.ok(!isValid({ email: 'invalid-email' }));
  assert.ok(!isValid({ website: 'not a website' }));
  assert.ok(!isValid({ website: 'ftp://bank.com' }));
  assert.ok(!isValid({ swiftCode: '12345' }));
});

test('active status defaults to true and accepts only booleans', () => {
  assert.equal(bankSchema.parse(validBank).isActive, true);
  assert.ok(isValid({ isActive: false }));
  assert.ok(!isValid({ isActive: 'true' }));
});
