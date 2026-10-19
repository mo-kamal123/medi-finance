import { useEffect, useRef, useState } from 'react';
import { FileText, Search, Trash2 } from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { getChequeInvoices, getInvoiceById } from '../api/cheques.api';
import {
  findChequeInvoiceByNumber,
  getChequeErrorMessage,
  getInvoiceRemaining,
  totalInvoicePayments,
  getChequeInvoiceParty,
  getChequeInvoiceSelectionError,
} from '../utils/cheque-payload';

const ChequeInvoiceSelector = ({
  chequeType,
  partyID,
  payments,
  onChange,
  onLoadingChange,
  errors,
  disabled,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const searchInvoice = async () => {
    if (disabled || requestPending.current) return;
    const number = invoiceNumber.trim();
    if (!number) {
      setError('أدخل رقم الفاتورة');
      return;
    }
    if (
      payments.some(
        (row) =>
          String(row.invoiceNumber).trim().toLowerCase() ===
          number.toLowerCase()
      )
    ) {
      setError('تمت إضافة هذه الفاتورة بالفعل');
      return;
    }
    requestPending.current = true;
    setIsLoading(true);
    setError('');
    onLoadingChange?.(true);
    const controller = new AbortController();
    requestController.current = controller;
    try {
      let invoice = await findChequeInvoiceByNumber(
        { chequeType, partyID, invoiceNumber: number },
        (params) => getChequeInvoices(params, controller.signal)
      );
      if (!mounted.current) return;
      if (!invoice) {
        setError(
          'لم يتم العثور على فاتورة مؤهلة بهذا الرقم لنفس نوع الشيك والطرف'
        );
        return;
      }
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
          invoiceNumber: invoice.invoiceNumber || number,
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
            أضف رقم الفاتورة لتعبئة {chequeType === '0' ? 'العميل' : 'المورد'}{' '}
            تلقائياً، ثم حدد المبلغ كاملاً أو جزئياً.
          </p>
        </div>
        <div>
          <label
            htmlFor="cheque-invoice-number"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            رقم الفاتورة
          </label>
          <div className="flex items-start gap-2">
            <FormInput
              id="cheque-invoice-number"
              icon={Search}
              value={invoiceNumber}
              onChange={(event) => {
                setInvoiceNumber(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  event.stopPropagation();
                  searchInvoice();
                }
              }}
              placeholder="أدخل رقم الفاتورة"
              disabled={disabled || isLoading}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'cheque-invoice-search-error' : undefined
              }
            />
            <button
              type="button"
              onClick={searchInvoice}
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
