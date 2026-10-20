import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { getChequeInvoices, getInvoiceById } from '../api/cheques.api';
import {
  buildChequeInvoiceQuery,
  getChequeErrorMessage,
  getInvoiceRemaining,
  totalInvoicePayments,
  getChequeInvoiceParty,
  getChequeInvoiceSelectionError,
} from '../utils/cheque-payload';

const ChequeInvoiceSelector = ({
  chequeType,
  payments,
  onChange,
  onLoadingChange,
  errors,
  disabled,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const requestPending = useRef(false);
  const mounted = useRef(true);
  const requestController = useRef(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestController.current?.abort();
      onLoadingChange?.(false);
    };
  }, [onLoadingChange]);

  const searchInvoice = async (pageNumber = 1) => {
    if (disabled || requestPending.current) return;
    const number = pageNumber === 1 ? invoiceNumber.trim() : searchTerm;
    if (!number) {
      setError('أدخل رقم الفاتورة أو الدفعة');
      return;
    }
    requestPending.current = true;
    setIsLoading(true);
    setError('');
    onLoadingChange?.(true);
    const controller = new AbortController();
    requestController.current = controller;
    try {
      const results = await getChequeInvoices(
        buildChequeInvoiceQuery({
          chequeType,
          invoiceNumber: number,
          pageNumber,
        }),
        controller.signal
      );
      if (!mounted.current) return;
      setSearchTerm(number);
      setSearchResults(results);
      if (!results.items.length) setError('لم يتم العثور على فواتير');
    } catch (requestError) {
      if (mounted.current && !controller.signal.aborted)
        setError(getChequeErrorMessage(requestError));
    } finally {
      requestPending.current = false;
      if (mounted.current) {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    }
  };

  const addInvoice = async (selectedInvoice) => {
    if (disabled || requestPending.current) return;
    requestPending.current = true;
    setIsLoading(true);
    setError('');
    onLoadingChange?.(true);
    try {
      let invoice = selectedInvoice;
      const invoiceID = Number(
        invoice.invoiceID ?? invoice.invoiceId ?? invoice.id
      );
      if (!Number.isInteger(invoiceID) || invoiceID <= 0) {
        setError('تعذر قراءة بيانات الفاتورة');
        return;
      }
      if (payments.some((row) => row.invoiceID === invoiceID)) {
        setError('تمت إضافة هذه الفاتورة بالفعل');
        return;
      }
      if (!getChequeInvoiceParty(invoice, chequeType)) {
        const details = await getInvoiceById(invoiceID);
        if (!mounted.current) return;
        invoice = { ...invoice, ...details };
      }
      const selectionIssue = getChequeInvoiceSelectionError(
        payments,
        invoice,
        chequeType
      );
      if (selectionIssue) {
        setError(selectionIssue);
        return;
      }
      const party = getChequeInvoiceParty(invoice, chequeType);
      const remainingAmount = getInvoiceRemaining(invoice);
      const availableAmount =
        invoice.availableAmount != null
          ? Number(invoice.availableAmount)
          : undefined;
      const amount = availableAmount ?? remainingAmount;
      if (!Number.isFinite(amount) || amount <= 0) {
        setError('لا يوجد مبلغ متاح للربط بهذه الفاتورة');
        return;
      }
      onChange([
        ...payments,
        {
          invoiceID,
          invoiceNumber: invoice.invoiceNumber || String(invoiceID),
          partyName: party.name,
          amount,
          remainingAmount,
          ...(availableAmount != null ? { availableAmount } : {}),
          ...(String(chequeType) === '0'
            ? { customerID: party.id }
            : { supplierID: party.id }),
        },
      ]);
      setInvoiceNumber('');
      setSearchResults(null);
    } catch (requestError) {
      if (mounted.current) setError(getChequeErrorMessage(requestError));
    } finally {
      requestPending.current = false;
      if (mounted.current) {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    }
  };

  return (
    <section
      className="overflow-hidden rounded-xl border border-primary/15 bg-white"
      aria-label="فواتير الشيك"
    >
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_minmax(320px,440px)] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={20} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold text-gray-900">فواتير الشيك</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              المحدد: {payments.length}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            ابحث برقم الفاتورة أو الدفعة واختر الفاتورة لتعبئة {chequeType === '0' ? 'العميل' : 'المورد'}{' '}
            تلقائياً، ثم حدد المبلغ كاملاً أو جزئياً.
          </p>
        </div>
        <div>
          <label
            htmlFor="cheque-invoice-number"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            رقم الفاتورة أو الدفعة
          </label>
          <div className="flex items-start gap-2">
            <FormInput
              id="cheque-invoice-number"
              icon={Search}
              value={invoiceNumber}
              onChange={(event) => {
                setInvoiceNumber(event.target.value);
                setError('');
                setSearchResults(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  event.stopPropagation();
                  searchInvoice();
                }
              }}
              placeholder="أدخل رقم الفاتورة أو الدفعة"
              disabled={disabled || isLoading}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'cheque-invoice-search-error' : undefined
              }
            />
            <button
              type="button"
              onClick={() => searchInvoice()}
              disabled={disabled || isLoading}
              className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Search size={16} />
              {isLoading ? 'جاري التحميل...' : 'بحث'}
            </button>
          </div>
          {error ? (
            <p
              id="cheque-invoice-search-error"
              role="alert"
              className="mt-2 text-sm text-red-600"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
      {searchResults?.items.length ? (
        <div
          className="space-y-3 border-b border-gray-100 p-4 sm:p-6"
          aria-label="نتائج بحث الفواتير"
          aria-busy={isLoading}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-gray-900">نتائج البحث</h3>
            <span className="text-xs text-gray-500">
              الصفحة {searchResults.pageNumber} من {searchResults.totalPages}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table
              className="w-full whitespace-nowrap text-right text-sm"
              aria-label="نتائج بحث الفواتير"
            >
              <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    الفاتورة
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {chequeType === '0' ? 'العميل' : 'المورد'}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    رقم الدفعة
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    المبلغ المتبقي
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">إضافة الفاتورة</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {searchResults.items.map((invoice) => {
                  const invoiceID = Number(
                    invoice.invoiceID ?? invoice.invoiceId ?? invoice.id
                  );
                  const isAdded = payments.some(
                    (row) => row.invoiceID === invoiceID
                  );
                  return (
                    <tr
                      key={invoiceID}
                      className="transition-colors hover:bg-gray-50/70"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          <bdi>{invoice.invoiceNumber}</bdi>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {invoice.invoiceTypeNameAr || 'فاتورة'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {getChequeInvoiceParty(invoice, chequeType)?.name ||
                          '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <bdi>{invoice.batchNumber || '-'}</bdi>
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-gray-900">
                        {formatCurrency(getInvoiceRemaining(invoice))}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <button
                          type="button"
                          disabled={disabled || isLoading || isAdded}
                          onClick={() => addInvoice(invoice)}
                          aria-label={`إضافة الفاتورة ${invoice.invoiceNumber || invoiceID}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                        >
                          {isAdded ? (
                            <Check size={15} aria-hidden="true" />
                          ) : (
                            <Plus size={15} aria-hidden="true" />
                          )}
                          {isAdded ? 'تمت الإضافة' : 'إضافة'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {searchResults.totalPages > 1 ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:opacity-40"
                disabled={
                  disabled || isLoading || searchResults.pageNumber <= 1
                }
                onClick={() => searchInvoice(searchResults.pageNumber - 1)}
              >
                <ChevronRight size={14} aria-hidden="true" />
                السابق
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:opacity-40"
                disabled={
                  disabled ||
                  isLoading ||
                  searchResults.pageNumber >= searchResults.totalPages
                }
                onClick={() => searchInvoice(searchResults.pageNumber + 1)}
              >
                التالي
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {payments.length ? (
        <div className="space-y-3 border-t border-gray-100 p-4 sm:p-5">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table
              className="w-full table-auto whitespace-nowrap text-center text-sm"
              aria-label="الفواتير المختارة"
            >
              <thead className="bg-primary text-white">
                <tr>
                  <th scope="col" className="p-3">
                    رقم الفاتورة
                  </th>
                  <th scope="col" className="p-3">
                    {chequeType === '0' ? 'العميل' : 'المورد'}
                  </th>
                  <th scope="col" className="p-3">
                    المتبقي
                  </th>
                  <th scope="col" className="p-3">
                    المتاح
                  </th>
                  <th scope="col" className="p-3">
                    المبلغ
                  </th>
                  {!disabled ? (
                    <th scope="col" className="p-3">
                      إزالة
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((row, index) => (
                  <tr
                    key={row.invoiceID}
                    className="even:bg-gray-50 hover:bg-gray-50"
                  >
                    <td className="p-3 font-semibold text-primary">
                      {row.invoiceNumber || row.invoiceID}
                    </td>
                    <td className="p-3 text-gray-600">
                      {row.partyName || '-'}
                    </td>
                    <td className="p-3">
                      {row.remainingAmount != null
                        ? formatCurrency(row.remainingAmount)
                        : '-'}
                    </td>
                    <td className="p-3">
                      {row.availableAmount != null
                        ? formatCurrency(row.availableAmount)
                        : '-'}
                    </td>
                    <td className="min-w-48 p-3">
                      <FormInput
                        type="number"
                        aria-label={
                          'مبلغ الفاتورة ' +
                          (row.invoiceNumber || row.invoiceID)
                        }
                        step="0.01"
                        min="0.01"
                        value={row.amount}
                        readOnly={disabled || isLoading}
                        onChange={(event) =>
                          onChange(
                            payments.map((payment, paymentIndex) =>
                              paymentIndex === index
                                ? { ...payment, amount: event.target.value }
                                : payment
                            )
                          )
                        }
                        error={errors?.[index]?.amount?.message}
                      />
                    </td>
                    {!disabled ? (
                      <td className="p-3">
                        <button
                          type="button"
                          disabled={isLoading}
                          aria-label={
                            'إزالة الفاتورة ' +
                            (row.invoiceNumber || row.invoiceID)
                          }
                          onClick={() => {
                            onChange(
                              payments.filter(
                                (payment) => payment.invoiceID !== row.invoiceID
                              )
                            );
                            setError('');
                          }}
                          className="self-end rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-semibold text-primary" aria-live="polite">
            إجمالي قيمة الشيك: {formatCurrency(totalInvoicePayments(payments))}
          </p>
        </div>
      ) : null}
      {errors?.message || errors?.root?.message ? (
        <p role="alert" className="px-5 pb-4 text-sm text-red-600">
          {errors.message || errors.root.message}
        </p>
      ) : null}
    </section>
  );
};

export default ChequeInvoiceSelector;
