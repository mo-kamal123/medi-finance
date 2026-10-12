import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookCheck, LoaderCircle, X } from 'lucide-react';
import { getErrorMessage } from '../../../../shared/lib/toast';
import { useCloseBatch } from '../shared/hooks/invoices.mutations';

const CloseBatchModal = ({ onClose, onSuccess, batchID, invoiceNumber }) => {
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const closeMutation = useCloseBatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const number = String(batchID ?? '').trim();
    if (!number) {
      setError('تعذر تحديد الدفعة المرتبطة بالفاتورة');
      return;
    }
    submitting.current = true;
    setError('');
    try {
      const response = await closeMutation.mutateAsync(number);
      onSuccess?.(response);
      onClose();
    } catch (error) {
      setError(getErrorMessage(error, 'تعذر إنشاء قيد إقفال الدفعة'));
    } finally {
      submitting.current = false;
    }
  };

  return createPortal(
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-batch-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-right shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2
            id="close-batch-title"
            className="flex items-center gap-2 text-lg font-semibold text-gray-900"
          >
            <BookCheck size={20} className="text-primary" />
            إنشاء قيد إقفال دفعة
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={closeMutation.isPending}
            aria-label="إغلاق"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <p className="text-sm text-gray-500">
            هل تريد إنشاء قيد إقفال الدفعة رقم{' '}
            <span className="font-semibold text-gray-900">{batchID}</span>
            {invoiceNumber ? ` المرتبطة بالفاتورة ${invoiceNumber}` : ''}؟
          </p>
          {error && (
            <p
              id="close-batch-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={closeMutation.isPending}
              className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={closeMutation.isPending || !batchID}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {closeMutation.isPending && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              {closeMutation.isPending
                ? 'جاري إنشاء القيد...'
                : 'تأكيد إنشاء قيد الإقفال'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CloseBatchModal;
