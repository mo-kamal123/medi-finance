import assert from 'node:assert/strict';
import test from 'node:test';
import { chequeSchema } from '../validation/cheque.validation.js';
import {
  buildChequePayload,
  buildChequeInvoiceQuery,
  normalizeChequeInvoices,
  getChequeErrorMessage,
  totalInvoicePayments,
  getChequeInvoiceParty,
  getChequeInvoiceSelectionError,
  findChequeInvoiceByNumber,
} from './cheque-payload.js';

test('number lookup does not fetch for an empty input', async () => {
  let calls = 0;
  assert.equal(await findChequeInvoiceByNumber({ invoiceNumber: '  ' }, async () => { calls += 1; }), null);
  assert.equal(calls, 0);
});

test('number lookup loads only the exact invoice and follows response pagination', async () => {
  const requests = [];
  const invoice = { invoiceID: 1261, invoiceNumber: 'INV-1261', supplierID: 999 };
  const result = await findChequeInvoiceByNumber({ chequeType: '1', invoiceNumber: ' INV-1261 ' }, async (params) => {
    requests.push(params);
    return { items: params.pageNumber === 1 ? [{ invoiceID: 99, invoiceNumber: 'INV-12610' }] : [invoice], totalPages: 2 };
  });
  assert.deepEqual(result, invoice);
  assert.deepEqual(requests.map((params) => params.pageNumber), [1, 2]);
  assert.equal(requests[0].invoiceNumber, 'INV-1261');
  assert.equal('supplierId' in requests[0], false);
});

test('number lookup never selects a partial match or unrelated invoice', async () => {
  assert.equal(await findChequeInvoiceByNumber({ chequeType: '0', invoiceNumber: 'INV-1' }, async () => ({ items: [{ invoiceID: 2, invoiceNumber: 'INV-12' }], totalPages: 1 })), null);
});

const receipt = {
  chequeType: '0',
  customerID: '120',
  supplierID: '999',
  chequeNumber: 'RCV-12457',
  chequeDate: '2026-10-18',
  receiptDate: '2026-10-18',
  dueDate: '2026-11-01',
  amount: '4000',
  currencyID: '1',
  exchangeRate: 1,
  bankID: '1087',
  bankAccountID: '1110',
};
const payment = {
  invoiceID: 1261,
  amount: '4000',
  remainingAmount: 5000,
  customerID: 120,
};
const parse = (changes = {}) => chequeSchema.parse({ ...receipt, ...changes });
const valid = (changes) =>
  chequeSchema.safeParse({ ...receipt, ...changes }).success;

test('receipt and payment cheques can be created without invoices and only use the correct party', () => {
  for (const chequeType of ['0', '1']) {
    const body = buildChequePayload(parse({ chequeType }));
    assert.equal(body.type, Number(chequeType));
    assert.equal(body.customerID, chequeType === '0' ? 120 : null);
    assert.equal(body.supplierID, chequeType === '1' ? 999 : null);
    for (const field of [
      'invoiceID',
      'invoices',
      'invoicePayments',
      'cashVoucherID',
      'statusID',
    ])
      assert.equal(field in body, false);
    for (const field of [
      'costCenterID',
      'collectionAccountID',
      'counterAccountID',
      'underDeliveryAccountID',
    ])
      assert.equal(body[field], null);
  }
  assert.equal(valid({ customerID: '' }), false);
  assert.equal(valid({ chequeType: '1', supplierID: '' }), false);
});

test('receipt example sends the exact invoicePayments allocation and no singular invoiceID', () => {
  const body = buildChequePayload(parse({ invoicePayments: [payment] }));
  assert.deepEqual(body.invoicePayments, [{ invoiceID: 1261, amount: 4000 }]);
  assert.equal(body.currencyID, 1);
  assert.equal(body.exchangeRate, 1);
  assert.equal(body.customerID, 120);
  assert.equal(body.supplierID, null);
  assert.equal(body.dueDate, '2026-11-01T00:00:00');
  assert.equal(body.receiptDate, '2026-10-18T00:00:00');
  assert.equal('invoiceID' in body, false);
  assert.equal('invoices' in body, false);
});

test('full remaining mode sends only invoice IDs and requires the full remaining totals', () => {
  const form = {
    invoiceAllocationMode: 'full',
    amount: '6000',
    invoicePayments: [
      { ...payment, amount: 5000 },
      { invoiceID: 1262, amount: 1000, remainingAmount: 1000 },
    ],
  };
  const body = buildChequePayload(parse(form));
  assert.deepEqual(body.invoices, [1261, 1262]);
  assert.equal('invoicePayments' in body, false);
  assert.equal(
    valid({ ...form, amount: 4000, invoicePayments: [payment] }),
    false
  );
});

test('allocations must total the cheque amount, using cents for exact comparison', () => {
  assert.equal(valid({ invoicePayments: [payment], amount: 3999 }), false);
  const rows = [
    { invoiceID: 1, amount: '0.1' },
    { invoiceID: 2, amount: '0.2' },
  ];
  assert.equal(totalInvoicePayments(rows), 0.3);
  assert.equal(valid({ amount: '0.30', invoicePayments: rows }), true);
});

test('duplicate invoices, nonpositive amounts and more than two decimal places are rejected', () => {
  assert.equal(
    valid({ amount: 8000, invoicePayments: [payment, payment] }),
    false
  );
  for (const amount of ['0', '-1', '1.001', 'Infinity', '', 'not a number']) {
    assert.equal(valid({ amount }), false, `cheque amount ${amount}`);
    assert.equal(
      valid({ invoicePayments: [{ ...payment, amount }] }),
      false,
      `invoice amount ${amount}`
    );
  }
});

test('allocations cannot exceed the known available balance after pending cheques', () => {
  assert.equal(
    valid({ invoicePayments: [{ ...payment, availableAmount: 3000 }] }),
    false
  );
  assert.equal(
    valid({ invoicePayments: [{ ...payment, availableAmount: 4000 }] }),
    true
  );
  assert.equal(
    valid({ invoicePayments: [{ ...payment, remainingAmount: 3999 }] }),
    false
  );
});

test('linked invoices require Egyptian pounds and rate 1', () => {
  assert.equal(valid({ invoicePayments: [payment], currencyID: '2' }), false);
  assert.equal(valid({ invoicePayments: [payment], exchangeRate: 1.1 }), false);
});

test('selected invoices must belong to the selected customer or supplier', () => {
  assert.equal(
    valid({ invoicePayments: [{ ...payment, customerID: 121 }] }),
    false
  );
  assert.equal(
    valid({
      chequeType: '1',
      invoicePayments: [{ ...payment, supplierID: 998 }],
    }),
    false
  );
  assert.equal(
    valid({
      chequeType: '1',
      invoicePayments: [{ ...payment, supplierID: 999 }],
    }),
    true
  );
});

test('invoice lookup uses chequeType including zero and the appropriate party ID', () => {
  assert.deepEqual(
    buildChequeInvoiceQuery({
      chequeType: '0',
      partyID: '120',
      invoiceNumber: ' RCV-1 ',
    }),
    {
      chequeType: 0,
      customerId: 120,
      invoiceNumber: 'RCV-1',
      pageNumber: 1,
      pageSize: 20,
    }
  );
  assert.deepEqual(
    buildChequeInvoiceQuery({
      chequeType: '1',
      partyID: '999',
      invoiceNumber: 'INV',
      pageNumber: 3,
      pageSize: 10,
    }),
    {
      chequeType: 1,
      supplierId: 999,
      invoiceNumber: 'INV',
      pageNumber: 3,
      pageSize: 10,
    }
  );
});

test('invoice search works before choosing a customer or supplier and never sends party ID zero', () => {
  for (const chequeType of ['0', '1']) {
    for (const partyID of [undefined, null, '', '0']) {
      assert.deepEqual(
        buildChequeInvoiceQuery({
          chequeType,
          partyID,
          invoiceNumber: 'INV-1',
        }),
        {
          chequeType: Number(chequeType),
          invoiceNumber: 'INV-1',
          pageNumber: 1,
          pageSize: 20,
        }
      );
    }
  }
});

test('invoice party is inferred using the cheque type and supports client/provider IDs', () => {
  const invoice = {
    customerID: 120,
    customerNameAr: 'عميل تجريبي',
    supplierID: 999,
    supplierNameAr: 'مورد تجريبي',
  };
  assert.deepEqual(getChequeInvoiceParty(invoice, '0'), {
    id: 120,
    name: 'عميل تجريبي',
  });
  assert.deepEqual(getChequeInvoiceParty(invoice, '1'), {
    id: 999,
    name: 'مورد تجريبي',
  });
  assert.deepEqual(
    getChequeInvoiceParty({ clientID: 120, clientName: 'عميل' }, '0'),
    { id: 120, name: 'عميل' }
  );
  assert.deepEqual(
    getChequeInvoiceParty({ providerId: 999, providerNameAr: 'مورد' }, '1'),
    { id: 999, name: 'مورد' }
  );
  assert.equal(getChequeInvoiceParty({ customerID: 120 }, '1'), null);
});

test('the first invoice establishes the party and subsequent invoices cannot mix parties', () => {
  for (const [chequeType, key] of [
    ['0', 'customerID'],
    ['1', 'supplierID'],
  ]) {
    assert.equal(
      getChequeInvoiceSelectionError([], { [key]: 120 }, chequeType),
      ''
    );
    assert.equal(
      getChequeInvoiceSelectionError(
        [{ [key]: 120 }],
        { [key]: 120 },
        chequeType
      ),
      ''
    );
    assert.notEqual(
      getChequeInvoiceSelectionError(
        [{ [key]: 120 }],
        { [key]: 121 },
        chequeType
      ),
      ''
    );
    assert.notEqual(
      getChequeInvoiceSelectionError([], { invoiceID: 1261 }, chequeType),
      ''
    );
  }
});

test('invoice results use response pagination for top-level and nested envelopes', () => {
  const params = { pageNumber: 2, pageSize: 20 };
  const items = [{ invoiceID: 1261 }];
  assert.deepEqual(
    normalizeChequeInvoices(
      { data: items, totalPages: 4, pageNumber: 2, pageSize: 20 },
      params
    ),
    { items, totalPages: 4, pageNumber: 2, pageSize: 20 }
  );
  assert.equal(
    normalizeChequeInvoices({ data: { items, totalCount: 61 } }, params)
      .totalPages,
    4
  );
});

test('API rejection details and validation errors remain visible', () => {
  const message = 'المبلغ يتجاوز المتاح بعد الشيكات المعلقة';
  assert.equal(
    getChequeErrorMessage({ response: { data: { detail: message } } }),
    message
  );
  assert.match(
    getChequeErrorMessage({
      response: { data: { errors: { InvoicePayments: [message] } } },
    }),
    new RegExp(message)
  );
});
