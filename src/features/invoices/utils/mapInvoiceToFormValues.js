export const createEmptyDetail = () => ({
  productServiceID: '',
  quantity: 1,
  unitPrice: 0,
  discountPercentage: 0,
  taxPercentage: 0,
});

export const INVOICE_STATUS_OPTIONS = [
  { value: '0', label: 'Draft' },
  { value: '1', label: 'Paid' },
  { value: '2', label: 'Overdue' },
];

export const getInvoiceStatusId = (status) => {
  const matchedStatus = INVOICE_STATUS_OPTIONS.find(
    (option) => option.label.toLowerCase() === String(status).toLowerCase()
  );

  return matchedStatus?.value || '0';
};

export const getInvoiceStatusName = (statusId) => {
  const matchedStatus = INVOICE_STATUS_OPTIONS.find(
    (option) => option.value === String(statusId)
  );

  return matchedStatus?.label || 'Draft';
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
  status: 'Draft',
  statusId: '0',
  details: [createEmptyDetail()],
};

export const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

export const mapInvoiceToFormValues = (invoice) => {
  if (!invoice || Object.keys(invoice).length === 0) {
    return defaultValues;
  }

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
    status: invoice.status || getInvoiceStatusName(invoice.statusId),
    statusId:
      invoice.statusId !== undefined && invoice.statusId !== null
        ? String(invoice.statusId)
        : getInvoiceStatusId(invoice.status),
    details:
      invoice.invoiceDetails?.length > 0
        ? invoice.invoiceDetails.map((item) => ({
            productServiceID: item.productServiceID
              ? String(item.productServiceID)
              : '',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
            discountPercentage: item.discountPercentage ?? 0,
            taxPercentage: item.taxPercentage ?? 0,
          }))
        : invoice.details?.length > 0
          ? invoice.details.map((item) => ({
              productServiceID: item.productServiceID
                ? String(item.productServiceID)
                : '',
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice ?? 0,
              discountPercentage: item.discountPercentage ?? 0,
              taxPercentage: item.taxPercentage ?? 0,
            }))
          : [createEmptyDetail()],
  };
};
