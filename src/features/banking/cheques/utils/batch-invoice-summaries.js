export const normalizeBatchInvoiceSummary = (response, batchNumber) => {
  const summary = response?.data ?? response;
  const amount = Number(summary?.netAmount);
  const supplierID = Number(summary?.supplierID);
  const invoiceID = Number(summary?.invoiceID);
  if (
    response?.success === false ||
    typeof summary?.supplierName !== 'string' ||
    !summary.supplierName.trim() ||
    !Number.isInteger(invoiceID) || invoiceID <= 0 ||
    typeof summary.invoiceNumber !== 'string' || !summary.invoiceNumber.trim() ||
    summary.netAmount == null ||
    summary.netAmount === '' ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error('تعذر العثور على ملخص فاتورة الدفعة');
  }
  return {
    batchNumber,
    supplierID: Number.isInteger(supplierID) && supplierID > 0 ? supplierID : null,
    supplierName: summary.supplierName.trim(),
    invoiceID,
    invoiceNumber: summary.invoiceNumber.trim(),
    netAmount: amount,
  };
};

export const getBatchInvoiceSelectionError = (batches, summary) => {
  if (batches.some((batch) => batch.invoiceID === summary.invoiceID)) {
    return 'تمت إضافة هذه الفاتورة بالفعل';
  }
  if (batches.some((batch) => batch.supplierID && summary.supplierID
    ? batch.supplierID !== summary.supplierID
    : batch.supplierName !== summary.supplierName)) {
    return 'يجب أن تكون فواتير الشيك لنفس المورد';
  }
  return '';
};

export const totalBatchInvoiceAmount = (batches) =>
  batches.reduce((total, batch) => total + Math.round(batch.netAmount * 100), 0) / 100;
