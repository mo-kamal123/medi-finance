export const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

export const toApiDateTime = (value) => {
  const dateValue = toDateInputValue(value);
  return dateValue ? `${dateValue}T00:00:00` : null;
};

export const buildCashVoucherPayload = (formData) => {
  const firstDetail = formData.details?.[0] || {};
  const partyId = firstDetail.partyID ? Number(firstDetail.partyID) : null;
  const paymentModeId = Number(formData.paymentModeId) || 1;

  const payload = {
    isReceipt: formData.isReceipt,
    paymentModeId,
    statusId: formData.statusId ? Number(formData.statusId) : null,
    description: firstDetail.notes || '',
    date: toApiDateTime(formData.date),
    name: firstDetail.partyName || '',
    amount: Number(firstDetail.amount) || 0,
    invoiceNumber: formData.invoiceNumber || null,
    customerId: formData.isReceipt ? partyId : null,
    supplierId: formData.isReceipt ? null : partyId,
  };

  if (paymentModeId === 1) {
    payload.bankId = formData.bankId ? Number(formData.bankId) : null;
    payload.bankAccountId = formData.bankAccountId ? Number(formData.bankAccountId) : null;
    payload.checkNumber = formData.checkNumber || null;
    payload.receiptDate = toApiDateTime(formData.receiptDate);
    payload.dueDate = toApiDateTime(formData.dueDate);
  }

  if (paymentModeId === 2) {
    payload.costCenterId = formData.costCenterId ? Number(formData.costCenterId) : null;
  }

  if (paymentModeId === 3) {
    payload.bankId = formData.bankId ? Number(formData.bankId) : null;
    payload.bankAccountId = formData.bankAccountId ? Number(formData.bankAccountId) : null;
  }

  return payload;
};

export const mapCashVoucherToFormValues = (defaultValues = {}) => {
  const initialAmount =
    defaultValues?.amount ??
    defaultValues?.netAmount ??
    defaultValues?.details?.[0]?.amount ??
    '';
  const initialName =
    defaultValues?.name ??
    defaultValues?.receivedFrom ??
    defaultValues?.paidTo ??
    defaultValues?.partyName ??
    '';
  const initialNotes =
    defaultValues?.description ??
    defaultValues?.notes ??
    defaultValues?.details?.[0]?.notes ??
    '';

  const customerId = defaultValues?.customerId ?? defaultValues?.customerID ?? null;
  const supplierId = defaultValues?.supplierId ?? defaultValues?.supplierID ?? null;
  const partyId = customerId ?? supplierId ?? '';

  return {
    isReceipt:
      typeof defaultValues?.isReceipt === 'boolean'
        ? defaultValues.isReceipt
        : String(defaultValues?.voucherType || '').toLowerCase() !== 'payment',
    voucherID:
      defaultValues?.voucherID ??
      defaultValues?.voucherId ??
      defaultValues?.id ??
      '',
    statusId:
      defaultValues?.statusId != null
        ? String(defaultValues.statusId)
        : defaultValues?.status != null
          ? String(defaultValues.status)
          : '',
    paymentModeId: (() => {
      if (defaultValues?.paymentModeId != null) return String(defaultValues.paymentModeId);
      if (defaultValues?.paymentMode != null) {
        const modeMap = {
          Check: '1',
          Cash: '2',
          BankTransfer: '3',
        };
        return modeMap[defaultValues.paymentMode] || '1';
      }
      return '1';
    })(),
    bankId:
      defaultValues?.bankId != null
        ? String(defaultValues.bankId)
        : defaultValues?.bankID != null
          ? String(defaultValues.bankID)
          : '',
    bankName: defaultValues?.bankName ?? '',
    bankAccountId:
      defaultValues?.bankAccountId != null
        ? String(defaultValues.bankAccountId)
        : defaultValues?.bankAccountID != null
          ? String(defaultValues.bankAccountID)
          : '',
    bankAccount:
      defaultValues?.bankAccount ??
      defaultValues?.accountNumberWithBranch ??
      defaultValues?.accountNumber ??
      '',
    checkNumber: defaultValues?.checkNumber ?? '',
    receiptDate: toDateInputValue(defaultValues?.receiptDate),
    dueDate: toDateInputValue(defaultValues?.dueDate),
    description: initialNotes,
    date: toDateInputValue(defaultValues?.date || defaultValues?.voucherDate),
    name: initialName,
    amount: initialAmount,
    invoiceNumber:
      defaultValues?.invoiceNumber ??
      defaultValues?.relatedInvoiceNumber ??
      '',
    costCenterId:
      defaultValues?.costCenterId != null
        ? String(defaultValues.costCenterId)
        : defaultValues?.costCenterID != null
          ? String(defaultValues.costCenterID)
          : '',
    customerId,
    supplierId,
    isCleared:
      typeof defaultValues?.isCleared === 'boolean'
        ? defaultValues.isCleared
        : false,
    isVoid:
      typeof defaultValues?.isVoid === 'boolean' ? defaultValues.isVoid : false,
    details:
      defaultValues?.details?.length > 0
        ? defaultValues.details.map((detail) => ({
            amount: detail.amount ?? '',
            notes: detail.notes ?? '',
            partyID: String(
              detail.partyID ??
                detail.partyId ??
                detail.customerId ??
                detail.customerID ??
                detail.supplierId ??
                detail.supplierID ??
                partyId ??
                ''
            ),
            partyName: detail.partyName ?? initialName,
          }))
        : [
            {
              amount: initialAmount,
              notes: initialNotes,
              partyID: String(partyId),
              partyName: initialName,
            },
          ],
  };
};
