import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildGeneralInvoicePayload,
  calculateGeneralInvoiceTotals,
  generalInvoiceDefaults,
  generalInvoiceSchema,
} from './general-invoice-utils.js';

const cash = {
  invoiceNumber: 'EXP-2026-0001',
  invoiceDate: '2026-11-23T00:00:00',
  invoiceTypeID: 8,
  financialPeriodID: 4,
  paymentSource: 'Cash',
  bankAccountID: null,
  referenceNumber: 'HOSP-001',
  descriptionAr: 'ضيافة اجتماع',
  details: [
    { accountID: 7105, amount: 1500, taxPercentage: 0, descriptionAr: 'ضيافة' },
  ],
};
const bank = {
  ...cash,
  invoiceNumber: 'EXP-2026-0002',
  paymentSource: 'Bank',
  bankAccountID: 1131,
  referenceNumber: 'OFFICE-001',
  descriptionAr: 'شراء مستلزمات مكتبية',
  details: [
    {
      accountID: 7106,
      amount: 2500,
      taxPercentage: 14,
      descriptionAr: 'مستلزمات مكتبية',
    },
  ],
};

test('both supplied examples survive form mapping, validation and serialization exactly', () => {
  for (const invoice of [cash, bank]) {
    assert.deepEqual(
      buildGeneralInvoicePayload(
        generalInvoiceSchema.parse(generalInvoiceDefaults(invoice))
      ),
      invoice
    );
  }
});

test('cash clears a stale bank selection and unrelated invoice fields never enter the payload', () => {
  const form = {
    ...generalInvoiceDefaults(cash),
    bankAccountID: '1131',
    customerID: 3,
    supplierID: 4,
    dueDate: '2026-12-01',
  };
  assert.deepEqual(
    buildGeneralInvoicePayload(generalInvoiceSchema.parse(form)),
    cash
  );
});

test('bank requires a valid account, cash does not', () => {
  for (const bankAccountID of ['', null, '0', '-1', '1.5', 'NaN', 'Infinity']) {
    assert.equal(
      generalInvoiceSchema.safeParse({
        ...generalInvoiceDefaults(bank),
        bankAccountID,
      }).success,
      false
    );
  }
  assert.equal(
    generalInvoiceSchema.safeParse(generalInvoiceDefaults(cash)).success,
    true
  );
});

test('invalid headers, empty details and invalid detail amounts are rejected', () => {
  const form = generalInvoiceDefaults(cash);
  for (const change of [
    { invoiceNumber: ' ' },
    { invoiceDate: '2026-02-30' },
    { financialPeriodID: '' },
    { paymentSource: 'Check' },
    { details: [] },
  ]) {
    assert.equal(
      generalInvoiceSchema.safeParse({ ...form, ...change }).success,
      false
    );
  }
  for (const change of [
    { accountID: '' },
    { amount: '' },
    { amount: '0' },
    { amount: '-1' },
    { amount: 'Infinity' },
    { taxPercentage: '-1' },
    { taxPercentage: '101' },
    { taxPercentage: '' },
  ]) {
    assert.equal(
      generalInvoiceSchema.safeParse({
        ...form,
        details: [{ ...form.details[0], ...change }],
      }).success,
      false
    );
  }
});

test('tax totals cover cash, taxed bank and mixed lines', () => {
  assert.deepEqual(calculateGeneralInvoiceTotals(cash.details), {
    totalAmount: 1500,
    taxAmount: 0,
    totalDiscounts: 0,
    netAmount: 1500,
  });
  assert.deepEqual(calculateGeneralInvoiceTotals(bank.details), {
    totalAmount: 2500,
    taxAmount: 350,
    totalDiscounts: 0,
    netAmount: 2850,
  });
  assert.deepEqual(
    calculateGeneralInvoiceTotals([...cash.details, ...bank.details]),
    { totalAmount: 4000, taxAmount: 350, totalDiscounts: 0, netAmount: 4350 }
  );
});

test('details returned as invoiceDetails map correctly for editing', () => {
  const { details, ...header } = bank;
  assert.deepEqual(
    generalInvoiceDefaults({ ...header, invoiceDetails: details }),
    generalInvoiceDefaults(bank)
  );
});
