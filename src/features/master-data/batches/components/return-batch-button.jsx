import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, Undo2 } from 'lucide-react';
import { updateBatchStatus } from '../api/batches.api';
import { invoicesKeys } from '../../../transactions/invoices/shared/hooks/invoices.keys';
import { getErrorMessage, toast } from '../../../../shared/lib/toast';

const ReturnBatchButton = ({ batchNumber, status, statusID, iconOnly = false, className = '' }) => {
  const queryClient = useQueryClient();
  const submitting = useRef(false);
  const isReturned = Number(statusID) === 7 || String(status ?? '').trim() === 'مرسل للمطالبات';
  const mutation = useMutation({
    mutationFn: updateBatchStatus,
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['batches', 'list'] }),
        queryClient.invalidateQueries({ queryKey: invoicesKeys.batch(String(batchNumber)) }),
        queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: invoicesKeys.details() }),
      ]);
      toast.success('تم إرجاع الدفعة للمطالبات بنجاح');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'تعذر إرجاع الدفعة للمطالبات')),
  });
  const hasReturned = isReturned || (mutation.isSuccess && mutation.variables?.batchNumber === batchNumber);

  const handleReturn = async (event) => {
    event.stopPropagation();
    if (submitting.current || hasReturned) return;
    submitting.current = true;
    try {
      await mutation.mutateAsync({ batchNumber, statusID: 7 });
    } catch {
      // The mutation displays the server error through the toast.
    } finally {
      submitting.current = false;
    }
  };

  return (
    <button
      type="button"
      onClick={handleReturn}
      disabled={mutation.isPending || hasReturned || !String(batchNumber ?? '').trim()}
      title={hasReturned ? 'تم إرجاع الدفعة للمطالبات' : 'إرجاع للمطالبات'}
      aria-label={`إرجاع الدفعة ${batchNumber ?? ''} للمطالبات`}
      className={`inline-flex items-center justify-center gap-2 rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {mutation.isPending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Undo2 size={18} aria-hidden="true" />}
      {!iconOnly && (mutation.isPending ? 'جاري الإرجاع...' : 'ارجاع للمطالبات')}
    </button>
  );
};

export default ReturnBatchButton;
