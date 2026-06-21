export const PAYMENT_MODE_OPTIONS = [
  { value: '1', label: 'نقدي' },
  { value: '2', label: 'شيك' },
  { value: '3', label: 'تحويل بنكي' },
];

export const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

export const toApiDateTime = (value) => {
  const dateValue = toDateInputValue(value);
  return dateValue ? `${dateValue}T00:00:00` : null;
};

const getPaymentModeValue = (mode) =>
  String(mode?.id ?? mode?.paymentModeId ?? mode?.value ?? '');

const getPaymentModeLabel = (mode) =>
  mode?.nameAr ?? mode?.name ?? mode?.nameEn ?? mode?.label ?? '';

export const resolvePaymentModeId = (voucher, modes = []) => {
  if (voucher?.paymentModeId !== undefined && voucher?.paymentModeId !== null) {
    return String(voucher.paymentModeId);
  }

  if (modes.length > 0) {
    return getPaymentModeValue(modes[0]);
  }

  return '1';
};

export const buildCashVoucherPayload = (formData) => {
  const firstDetail = formData.details?.[0] || {};
  const partyId = firstDetail.partyID ? Number(firstDetail.partyID) : null;

  return {
    isReceipt: formData.isReceipt,
    paymentModeId: Number(formData.paymentModeId || 1),
    bankId: formData.bankId ? Number(formData.bankId) : null,
    bankAccountId: formData.bankAccountId ? Number(formData.bankAccountId) : null,
    checkNumber: formData.checkNumber || null,
    fromBankAccountId: formData.fromBankAccountId
      ? Number(formData.fromBankAccountId)
      : null,
    toBankAccountId: formData.toBankAccountId
      ? Number(formData.toBankAccountId)
      : null,
    description: firstDetail.notes || formData.description || '',
    date: toApiDateTime(formData.date),
    name: firstDetail.partyName || formData.name || '',
    amount: Number(firstDetail.amount || formData.amount) || 0,
    invoiceNumber: formData.invoiceNumber || null,
    customerId: formData.isReceipt ? partyId : null,
    supplierId: formData.isReceipt ? null : partyId,
    costCenterId: formData.costCenterId ? Number(formData.costCenterId) : null,
  };
};

export const mapCashVoucherToFormValues = (defaultValues = {}, paymentModes = []) => {
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
    paymentModeId: resolvePaymentModeId(defaultValues, paymentModes),
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
    fromBankAccountId:
      defaultValues?.fromBankAccountId != null
        ? String(defaultValues.fromBankAccountId)
        : '',
    toBankAccountId:
      defaultValues?.toBankAccountId != null
        ? String(defaultValues.toBankAccountId)
        : '',
    checkNumber: defaultValues?.checkNumber ?? '',
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

export const getPaymentModeOptions = (modes = []) =>
  modes.length > 0
    ? modes.map((mode) => ({
        value: getPaymentModeValue(mode),
        label: getPaymentModeLabel(mode),
      }))
    : PAYMENT_MODE_OPTIONS;
