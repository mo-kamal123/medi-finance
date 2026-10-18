export const TEST_BATCH_NUMBER = 'TEST-ATTACHMENTS';

export const testBatch = {
  batchNumber: TEST_BATCH_NUMBER,
  batchDate: '2052-05-11',
  supplierName: 'مورد تجريبي',
  claimsCount: 2,
  amount: 1234,
  totalAmount: 1234,
  status: 'closed',
  clients: [
    { clientID: 1, clientCode: 'TEST-001', customerName: 'عميل تجريبي', claimsCount: 2, totalBeforeCopayment: 1234, totalAfterCopayment: 1234, totalAfterRevision: 1234, totalAmount: 1234 },
  ],
  attachments: [
    { attachmentID: 1, fileName: 'batch-summary.txt', fileSize: 118, filePath: `${import.meta.env.BASE_URL}test-batches/batch-summary.txt` },
    { attachmentID: 2, fileName: 'claims-notes.txt', fileSize: 116, filePath: `${import.meta.env.BASE_URL}test-batches/claims-notes.txt` },
  ],
};
