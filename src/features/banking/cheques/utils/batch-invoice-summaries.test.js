import assert from 'node:assert/strict';
import test from 'node:test';
import { getBatchInvoiceSelectionError, normalizeBatchInvoiceSummary, totalBatchInvoiceAmount } from './batch-invoice-summaries.js';

test('summary response keeps supplier and invoice IDs, invoice number, and net amount', () => {
  assert.deepEqual(normalizeBatchInvoiceSummary({ success: true, data: { supplierName: 'الفا لاب', supplierID: 1125, invoiceID: 1246, invoiceNumber: '324-202610-0002', netAmount: 77680.63 } }, '4450'), {
    batchNumber: '4450', supplierName: 'الفا لاب', supplierID: 1125, invoiceID: 1246, invoiceNumber: '324-202610-0002', netAmount: 77680.63,
  });
});

test('a successful response without supplierID still loads the invoice and supplier name', () => {
  const summary = normalizeBatchInvoiceSummary({
    success: true,
    data: { supplierName: 'عادل جاد يونان', invoiceID: 1243, invoiceNumber: '324-202610-0001', netAmount: 30363.44 },
  }, '4450');
  assert.equal(summary.supplierID, null);
  assert.equal(summary.supplierName, 'عادل جاد يونان');
  assert.equal(summary.invoiceNumber, '324-202610-0001');
  assert.equal(summary.netAmount, 30363.44);
  assert.equal(getBatchInvoiceSelectionError([summary], { ...summary, invoiceID: 1244, supplierID: 1125 }), '');
  assert.ok(getBatchInvoiceSelectionError([summary], { ...summary, invoiceID: 1244, supplierName: 'مورد آخر' }));
});

test('a cheque accepts multiple invoices for its supplier and rejects duplicates or another supplier', () => {
  const batches = [{ supplierID: 1125, invoiceID: 1246 }];
  assert.equal(getBatchInvoiceSelectionError(batches, { supplierID: 1125, invoiceID: 1247 }), '');
  assert.ok(getBatchInvoiceSelectionError(batches, { supplierID: 1125, invoiceID: 1246 }));
  assert.ok(getBatchInvoiceSelectionError(batches, { supplierID: 1126, invoiceID: 1247 }));
});

test('failed or incomplete summaries cannot affect cheque totals', () => {
  for (const response of [null, { success: false }, { data: {} }, { data: { supplierName: 'Supplier', netAmount: null } }, { data: { supplierName: 'Supplier', netAmount: -10 } }]) {
    assert.throws(() => normalizeBatchInvoiceSummary(response, '4450'));
  }
});

test('adding and removing batches calculates exact totals in cents', () => {
  const batches = [{ netAmount: 30363.44 }, { netAmount: 100.1 }, { netAmount: 0.2 }];
  assert.equal(totalBatchInvoiceAmount(batches), 30463.74);
  assert.equal(totalBatchInvoiceAmount(batches.slice(0, 1)), 30363.44);
  assert.equal(totalBatchInvoiceAmount([]), 0);
});
