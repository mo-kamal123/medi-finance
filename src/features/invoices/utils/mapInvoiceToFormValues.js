export const createEmptyDetail = () => ({
  productServiceID: '',
  serviceTypeID: '',
  quantity: 1,
  unitPrice: 0,
  discountPercentage: 0,
  taxPercentage: 0,
});

export const defaultValues = {
  invoiceNumber: '',
  invoiceDate: '',
  dueDate: '',
  invoiceTypeID: '',
  customerID: '',
  supplierID: '',
  taxAmount: 0,
  discountAmount: 0,
  financialPeriodID: '',
  status: 'Posted',
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
    status: invoice.status || 'Posted',
    details:
      invoice.invoiceDetails?.length > 0
        ? invoice.invoiceDetails.map((item) => ({
            productServiceID: item.productServiceID
              ? String(item.productServiceID)
              : '',
            serviceTypeID: item.serviceTypeID ? String(item.serviceTypeID) : '',
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
