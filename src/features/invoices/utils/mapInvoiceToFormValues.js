export const createEmptyDetail = () => ({
  productServiceID: '',
  quantity: 1,
  unitPrice: 0,
  discountPercentage: 0,
  taxPercentage: 0,
});

export const INVOICE_STATUS_OPTIONS = [
  { value: '0', label: 'مسودة' },
  { value: '1', label: 'مرحل' },
  { value: '2', label: 'مدفوعة' },
  { value: '3', label: 'متأخرة' },
];

const getStatusOptionValue = (status) =>
  String(status?.id ?? status?.statusId ?? status?.value ?? '');

const getStatusOptionLabel = (status) =>
  status?.nameAr ?? status?.name ?? status?.nameEn ?? status?.label ?? '';

export const resolveInvoiceStatusId = (invoice, statuses = []) => {
  if (invoice?.statusId !== undefined && invoice?.statusId !== null) {
    return String(invoice.statusId);
  }

  const statusText = String(invoice?.status ?? '').trim();
  if (!statusText) return '0';

  const fromApi = statuses.find(
    (option) =>
      getStatusOptionLabel(option) === statusText ||
      getStatusOptionValue(option) === statusText
  );
  if (fromApi) return getStatusOptionValue(fromApi);

  const fromFallback = INVOICE_STATUS_OPTIONS.find(
    (option) =>
      option.label === statusText ||
      option.label.toLowerCase() === statusText.toLowerCase()
  );
  if (fromFallback) return fromFallback.value;

  return '0';
};

export const getInvoiceStatusName = (statusId, statuses = []) => {
  const fromApi = statuses.find(
    (option) => getStatusOptionValue(option) === String(statusId)
  );
  if (fromApi) return getStatusOptionLabel(fromApi);

  const fromFallback = INVOICE_STATUS_OPTIONS.find(
    (option) => option.value === String(statusId)
  );
  return fromFallback?.label || 'مسودة';
};

const getTodayDateInputValue = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
};

export const defaultValues = {
  invoiceNumber: '',
  invoiceDate: getTodayDateInputValue(),
  dueDate: getTodayDateInputValue(),
  invoiceTypeID: '',
  customerID: '',
  supplierID: '',
  taxAmount: 0,
  discountAmount: 0,
  financialPeriodID: '',
  statusId: '0',
  details: [createEmptyDetail()],
};

export const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const mapDetailToForm = (item) => ({
  ...(item.invoiceDetailID
    ? { invoiceDetailID: item.invoiceDetailID }
    : {}),
  productServiceID: item.productServiceID
    ? String(item.productServiceID)
    : '',
  quantity: item.quantity ?? 1,
  unitPrice: item.unitPrice ?? 0,
  discountPercentage: item.discountPercentage ?? 0,
  taxPercentage: item.taxPercentage ?? 0,
});

export const mapInvoiceToFormValues = (invoice, statuses = []) => {
  if (!invoice || Object.keys(invoice).length === 0) {
    return defaultValues;
  }

  const sourceDetails =
    invoice.details?.length > 0
      ? invoice.details
      : invoice.invoiceDetails?.length > 0
        ? invoice.invoiceDetails
        : [];

  return {
    invoiceNumber: invoice.invoiceNumber || '',
    invoiceDate: toDateInputValue(invoice.invoiceDate),
    dueDate: toDateInputValue(invoice.dueDate),
    invoiceTypeID: invoice.invoiceTypeID ? String(invoice.invoiceTypeID) : '',
    customerID: invoice.customerID ? String(invoice.customerID) : '',
    supplierID: invoice.supplierID ? String(invoice.supplierID) : '',
    taxAmount: invoice.taxAmount ?? 0,
    discountAmount: invoice.discountAmount ?? 0,
    financialPeriodID: invoice.financialPeriodID
      ? String(invoice.financialPeriodID)
      : '',
    statusId: resolveInvoiceStatusId(invoice, statuses),
    details:
      sourceDetails.length > 0
        ? sourceDetails.map(mapDetailToForm)
        : [createEmptyDetail()],
  };
};

export const buildInvoicePayload = (data, { isEditMode = false } = {}) => ({
  invoiceNumber: data.invoiceNumber,
  invoiceDate: new Date(data.invoiceDate).toISOString(),
  dueDate: new Date(data.dueDate).toISOString(),
  invoiceTypeID: Number(data.invoiceTypeID),
  customerID: data.customerID ? Number(data.customerID) : 0,
  supplierID: data.supplierID ? Number(data.supplierID) : 0,
  taxAmount: Number(data.taxAmount),
  discountAmount: Number(data.discountAmount),
  financialPeriodID: Number(data.financialPeriodID),
  statusId: Number(data.statusId),
  details: data.details.map((item) => {
    const detail = {
      productServiceID: Number(item.productServiceID),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discountPercentage: Number(item.discountPercentage),
      taxPercentage: Number(item.taxPercentage),
    };

    if (isEditMode && item.invoiceDetailID) {
      detail.invoiceDetailID = Number(item.invoiceDetailID);
    }

    return detail;
  }),
});
