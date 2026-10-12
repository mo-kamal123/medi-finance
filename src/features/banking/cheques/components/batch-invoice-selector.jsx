import { useRef, useState } from 'react';
import { FileText, Plus, Search, Trash2 } from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import { formatCurrency } from '../../../transactions/invoices/shared/utils/format-currency';
import { getBatchInvoiceSummary } from '../api/cheques.api';
import { getBatchInvoiceSelectionError, normalizeBatchInvoiceSummary, totalBatchInvoiceAmount } from '../utils/batch-invoice-summaries';

const BatchInvoiceSelector = ({ batches, onChange, onLoadingChange }) => {
  const [batchNumber, setBatchNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const requestPending = useRef(false);

  const removeBatch = (number) => {
    onChange(batches.filter((batch) => batch.batchNumber !== number));
    setError('');
  };

  const addBatch = async () => {
    if (requestPending.current) return;
    const number = batchNumber.trim();
    if (!number) {
      setError('أدخل رقم الدفعة');
      return;
    }
    if (batches.some((batch) => String(batch.batchNumber).trim() === number)) {
      setError('تمت إضافة هذه الدفعة بالفعل');
      return;
    }
    requestPending.current = true;
    setIsLoading(true);
    onLoadingChange(true);
    setError('');
    try {
      const response = await getBatchInvoiceSummary(number);
      const summary = normalizeBatchInvoiceSummary(response, number);
      const selectionError = getBatchInvoiceSelectionError(batches, summary);
      if (selectionError) {
        setError(selectionError);
        return;
      }
      onChange([...batches, summary]);
      setBatchNumber('');
    } catch (err) {
      setError(err.response?.status === 404
        ? 'لم يتم العثور على فاتورة لهذه الدفعة'
        : 'تعذر تحميل ملخص فاتورة الدفعة. تحقق من الرقم وحاول مرة أخرى.');
    } finally {
      requestPending.current = false;
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-primary/15 bg-white shadow-sm" aria-label="فواتير الدفعات">
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_minmax(320px,440px)] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={20} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold text-gray-900">فواتير الدفعات</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">المحدد: {batches.length}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">أضف الدفعات التي سيغطيها شيك الصرف. تُملأ قيمة الشيك والمورد تلقائياً من الفواتير المحددة.</p>
        </div>

        <div>
          <label htmlFor="batch-invoice-number" className="mb-1.5 block text-sm font-medium text-gray-700">رقم الدفعة</label>
          <div className="flex items-start gap-2">
            <FormInput
              id="batch-invoice-number"
              icon={Search}
              value={batchNumber}
              onChange={(event) => { setBatchNumber(event.target.value); setError(''); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addBatch();
                }
              }}
              placeholder="أدخل رقم الدفعة"
              disabled={isLoading}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'batch-invoice-error' : undefined}
              inputClass={error ? 'border-red-400' : ''}
            />
            <button type="button" onClick={addBatch} disabled={isLoading} className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
              <Plus size={16} />{isLoading ? 'جاري التحميل...' : 'إضافة'}
            </button>
          </div>
          {error ? <p id="batch-invoice-error" role="alert" className="mt-2 text-sm text-red-500">{error}</p> : null}
        </div>
      </div>

      {batches.length > 0 ? (
        <>
          <div className="max-h-64 overflow-auto border-t border-gray-100">
            <table className="w-full text-start text-sm">
              <thead className="sticky top-0 bg-gray-50 text-gray-500">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start font-medium">رقم الدفعة</th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start font-medium">رقم الفاتورة</th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start font-medium">المورد</th>
                  <th scope="col" className="whitespace-nowrap px-5 py-3 text-start font-medium">صافي الفاتورة</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">حذف</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((batch) => (
                  <tr key={batch.batchNumber} className="hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-5 py-2.5"><span dir="ltr" className="text-gray-500">{batch.batchNumber}</span></td>
                    <td className="whitespace-nowrap px-5 py-2.5"><span dir="ltr" className="font-semibold text-primary">{batch.invoiceNumber}</span></td>
                    <td className="min-w-40 px-5 py-2.5 text-gray-700">{batch.supplierName}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 font-medium tabular-nums text-gray-900">{formatCurrency(batch.netAmount)}</td>
                    <td className="px-4 py-2.5 text-end">
                      <button type="button" disabled={isLoading} onClick={() => removeBatch(batch.batchNumber)} aria-label={`حذف الدفعة ${batch.batchNumber}`} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 bg-primary/5 px-5 py-3" aria-live="polite">
            <span className="text-sm font-medium text-gray-600">إجمالي قيمة الشيك</span>
            <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(totalBatchInvoiceAmount(batches))}</span>
          </div>
        </>
      ) : (
        <p className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-sm text-gray-400" aria-live="polite">لم يتم اختيار فواتير بعد. أضف رقم دفعة للبدء.</p>
      )}
    </section>
  );
};

export default BatchInvoiceSelector;
