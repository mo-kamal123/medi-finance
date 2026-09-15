import { ArrowDown, CalendarDays, Landmark, Lock, Receipt, Send, Tag, User, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';

const TransferConfirmModal = ({
  open,
  isInternal,
  fromLabel,
  toLabel,
  amount,
  notes,
  onConfirm,
  onClose,
  isPending,
}) => {
  if (!open) return null;

  const detailRow = (icon, label, value, ltr = false) => (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-gray-500">
        {icon}
        {label}
      </span>
      <span className="font-medium text-gray-900" dir={ltr ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-linear-to-br from-primary to-primary/70 px-6 pb-6 pt-7 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            title="إغلاق"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              {isInternal ? <Landmark size={22} /> : <Send size={22} />}
            </div>
            <div className="mt-2 text-base font-semibold">تأكيد عملية التحويل</div>
            <div className="mt-0.5 text-xs text-white/70">
              {isInternal ? 'تحويل داخلي بين الحسابات' : 'تحويل خارجي لطرف آخر'}
            </div>
            <div className="mt-4 text-center">
              <div className="text-xs text-white/70">المبلغ</div>
              <div className="mt-1 text-3xl font-bold tracking-tight" dir="ltr">
                {formatCurrency(amount)}
              </div>
            </div>
          </div>
        </div>

        {/* Transfer path */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Landmark size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500">من حساب</div>
              <div className="truncate text-sm font-semibold text-gray-900" dir="ltr">
                {fromLabel}
              </div>
            </div>
          </div>

          <div className="flex justify-center py-1">
            <ArrowDown size={18} className="text-gray-300" />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              {isInternal ? <Landmark size={18} /> : <User size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500">
                {isInternal ? 'إلى حساب' : 'إلى'}
              </div>
              <div className="truncate text-sm font-semibold text-gray-900">
                {toLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2.5 px-5 pt-4 text-sm">
          {detailRow(
            <Tag size={16} className="text-gray-400" />,
            'نوع العملية',
            isInternal ? 'تحويل داخلي' : 'تحويل خارجي'
          )}
          {detailRow(
            <CalendarDays size={16} className="text-gray-400" />,
            'التاريخ',
            formatDate(new Date())
          )}
          {detailRow(
            <Receipt size={16} className="text-gray-400" />,
            'رسوم التحويل',
            '0.00',
            true
          )}
          {notes
            ? detailRow(
                <Tag size={16} className="text-gray-400" />,
                'ملاحظات',
                notes
              )
            : null}
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 px-5 text-xs text-gray-400">
          <Lock size={13} />
           عملية آمنة ومشفرة بواسطه MediPay
        </div>

        {/* Actions */}
        <div className="mt-4 border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="w-full rounded-xl bg-primary py-3 text-base font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? 'جاري إرسال الطلب...' : 'تأكيد التحويل'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="mt-2 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferConfirmModal;