import { useRef, useState } from 'react';
import { FileText, Plus, Search, Trash2, X } from 'lucide-react';
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
    <section className="space-y-4 rounded-xl border border-gray-200 p-5" aria-label="فواتير الدفعات">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
        <h3 className="flex items-center gap-2 font-bold text-gray-900"><FileText size={18} className="text-primary" />فواتير الدفعات</h3>
        <p className="mt-1 text-sm text-gray-500">أضف الدفعات التي سيغطيها الشيك. تُحتسب قيمة الشيك من مجموع صافي الفواتير.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">المحدد: {batches.length}</span>
      </div>
      <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
        <div aria-live="polite">
          <p className="mb-2 text-sm font-medium text-gray-700">الفواتير المحددة</p>
          {batches.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="أرقام الفواتير المحددة">
              {batches.map((batch) => (
                <li key={batch.batchNumber} className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary">
                  <FileText size={14} aria-hidden="true" />
                  <span dir="ltr" className="font-semibold" title={`الدفعة: ${batch.batchNumber}`}>{batch.invoiceNumber}</span>
                  <button type="button" disabled={isLoading} onClick={() => removeBatch(batch.batchNumber)} aria-label={`إزالة الدفعة ${batch.batchNumber}`} className="rounded p-1 hover:bg-primary/10 disabled:opacity-50">
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">لم يتم اختيار فواتير بعد</p>
          )}
        </div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
        <FormInput
          label="إضافة فاتورة دفعة"
          icon={Search}
          value={batchNumber}
          onChange={(event) => { setBatchNumber(event.target.value); setError(''); }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addBatch();
            }
          }}
          placeholder="أدخل رقم الدفعة ثم اضغط Enter"
          disabled={isLoading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'batch-invoice-error' : undefined}
          inputClass={error ? 'border-red-400' : ''}
        />
        <button type="button" onClick={addBatch} disabled={isLoading} className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-white disabled:opacity-50">
          <Plus size={16} />{isLoading ? 'جاري التحميل...' : 'إضافة دفعة'}
        </button>
      </div>
      {error ? <p id="batch-invoice-error" role="alert" className="text-sm text-red-500">{error}</p> : null}
      </div>
      {batches.map((batch) => (
        <div key={batch.batchNumber} className="grid grid-cols-1 items-end gap-3 border-t border-gray-100 pt-4 sm:grid-cols-[1fr_2fr_1fr_auto]">
          <FormInput label="رقم الفاتورة" value={batch.invoiceNumber} title={`الدفعة: ${batch.batchNumber}`} readOnly />
          <FormInput label="اسم المورد" value={batch.supplierName} readOnly />
          <FormInput label="صافي الفاتورة" value={batch.netAmount.toFixed(2)} readOnly />
          <button type="button" disabled={isLoading} onClick={() => removeBatch(batch.batchNumber)} aria-label={`حذف الدفعة ${batch.batchNumber}`} className="rounded-lg p-3 text-red-500 hover:bg-red-50 disabled:opacity-50"><Trash2 size={18} /></button>
        </div>
      ))}
      {batches.length > 0 ? <p className="border-t border-gray-200 pt-4 font-semibold text-primary">إجمالي قيمة الشيك: {formatCurrency(totalBatchInvoiceAmount(batches))}</p> : null}
    </section>
  );
};

export default BatchInvoiceSelector;
