export const isMoneyAmount = (value) =>
  /^\d+(?:\.\d{1,2})?$/.test(String(value).trim()) &&
  Number.isFinite(Number(value)) &&
  Number(value) > 0;

export const toCents = (value) => Math.round(Number(value) * 100);
export const totalInvoicePayments = (payments) =>
  payments.reduce(
    (sum, row) =>
      sum + (Number.isFinite(Number(row.amount)) ? toCents(row.amount) : 0),
    0
  ) / 100;

const optionalId = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;

export const buildChequePayload = (data) => {
  const payments = data.invoicePayments ?? [];
  return {
    type: Number(data.chequeType),
    customerID:
      String(data.chequeType) === '0' ? optionalId(data.customerID) : null,
    supplierID:
      String(data.chequeType) === '1' ? optionalId(data.supplierID) : null,
    chequeNumber: data.chequeNumber,
    dueDate: data.dueDate ? `${data.dueDate}T00:00:00` : null,
    receiptDate: data.receiptDate ? `${data.receiptDate}T00:00:00` : null,
    amount: Number(data.amount),
    currencyID: payments.length ? 1 : optionalId(data.currencyID),
    exchangeRate: payments.length ? 1 : Number(data.exchangeRate) || 1,
    bankID: optionalId(data.bankID),
    bankAccountID: optionalId(data.bankAccountID),
    collectionAccountID: optionalId(data.collectionAccountID),
    counterAccountID: optionalId(data.counterAccountID),
    costCenterID: optionalId(data.costCenterID),
    underDeliveryAccountID: optionalId(data.underDeliveryAccountID),
    isBearerOnly: Boolean(data.isBearerOnly),
    beneficiaryName: data.beneficiaryName || null,
    branchName: data.branchName || null,
    notes: data.notes || null,
    ...(payments.length
      ? data.invoiceAllocationMode === 'full'
        ? { invoices: payments.map((row) => Number(row.invoiceID)) }
        : {
            invoicePayments: payments.map((row) => ({
              invoiceID: Number(row.invoiceID),
              amount: Number(row.amount),
            })),
          }
      : {}),
  };
};

export const buildChequeInvoiceQuery = ({
  chequeType,
  partyID,
  invoiceNumber = '',
  pageNumber = 1,
  pageSize = 20,
}) => ({
  chequeType: Number(chequeType),
  ...(optionalId(partyID)
    ? String(chequeType) === '0'
      ? { customerId: Number(partyID) }
      : { supplierId: Number(partyID) }
    : {}),
  invoiceNumber: invoiceNumber.trim(),
  pageNumber,
  pageSize,
});

export const getChequeInvoiceParty = (invoice, chequeType) => {
  const isReceipt = String(chequeType) === '0';
  const id = optionalId(
    isReceipt
      ? (invoice?.customerID ??
          invoice?.customerId ??
          invoice?.clientID ??
          invoice?.clientId)
      : (invoice?.supplierID ??
          invoice?.supplierId ??
          invoice?.providerID ??
          invoice?.providerId)
  );
  if (!id) return null;
  const name = isReceipt
    ? invoice.customerNameAr ||
      invoice.customerName ||
      invoice.customerNameEn ||
      invoice.clientName ||
      invoice.clientNameAr
    : invoice.supplierNameAr ||
      invoice.supplierName ||
      invoice.supplierNameEn ||
      invoice.providerNameAr ||
      invoice.providerName;
  return { id, name: name || invoice.partyName || String(id) };
};

export const getChequeInvoiceSelectionError = (
  payments,
  invoice,
  chequeType
) => {
  const party = getChequeInvoiceParty(invoice, chequeType);
  if (!party)
    return `تعذر تحديد ${String(chequeType) === '0' ? 'عميل' : 'مورد'} الفاتورة`;
  if (
    payments.some(
      (row) => getChequeInvoiceParty(row, chequeType)?.id !== party.id
    )
  ) {
    return `يجب أن تكون جميع الفواتير لنفس ${String(chequeType) === '0' ? 'العميل' : 'المورد'}`;
  }
  return '';
};

export const normalizeChequeInvoices = (response, params) => {
  const data = response?.data ?? response;
  const items = Array.isArray(data)
    ? data
    : (data?.items ?? data?.invoices ?? []);
  const totalCount = Number(
    data?.totalCount ?? response?.totalCount ?? items.length
  );
  return {
    items,
    totalPages: Math.max(
      1,
      Number(
        data?.totalPages ??
          response?.totalPages ??
          Math.ceil(totalCount / params.pageSize)
      )
    ),
    pageNumber: Number(
      data?.pageNumber ?? response?.pageNumber ?? params.pageNumber
    ),
    pageSize: Number(data?.pageSize ?? response?.pageSize ?? params.pageSize),
  };
};

export const findChequeInvoiceByNumber = async (filters, fetchPage) => {
  const number = filters.invoiceNumber.trim();
  if (!number) return null;
  let pageNumber = 1;
  let totalPages = 1;
  do {
    const response = await fetchPage(
      buildChequeInvoiceQuery({ ...filters, invoiceNumber: number, pageNumber })
    );
    const invoice = response.items.find(
      (row) =>
        String(row.invoiceNumber ?? '')
          .trim()
          .toLowerCase() === number.toLowerCase()
    );
    if (invoice) return invoice;
    totalPages = response.totalPages;
    pageNumber += 1;
  } while (pageNumber <= totalPages);
  return null;
};

export const getInvoiceRemaining = (invoice) =>
  Number(
    invoice.remainingAmount ??
      Math.max(
        0,
        Number(invoice.netAmount ?? invoice.totalAmount ?? 0) -
          Number(invoice.paidAmount ?? 0)
      )
  );

export const getChequeErrorMessage = (error) => {
  const data = error?.response?.data;
  const validation = data?.errors
    ? Object.values(data.errors)
        .flat()
        .filter((message) => typeof message === 'string')
        .join('، ')
    : '';
  return [
    data?.detail ||
      data?.message ||
      (!validation && data?.title) ||
      error?.message ||
      'تعذر حفظ الشيك',
    validation,
  ]
    .filter(Boolean)
    .join(' — ');
};
