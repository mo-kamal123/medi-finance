import {
  ArrowDown,
  CalendarDays,
  Landmark,
  Send,
  ShieldCheck,
  StickyNote,
  User,
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';

const TransferConfirmModal = ({
  open,
  isInternal,
  fromAccount,
  fromBank,
  toAccount,
  toBank,
  amount,
  notes,
  onConfirm,
  onClose,
  isPending,
}) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Payment card header */}
        <div className="relative overflow-hidden bg-linear-to-br from-primary via-primary/85 to-primary/60 p-6 text-white">
          {/* decorative glows */}
          <div className="pointer-events-none absolute -left-10 -bottom-14 h-32 w-32 rounded-full bg-white/10" />
          {/* <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/5" /> */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-black/10" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                {isInternal ? <Landmark size={19} /> : <Send size={19} />}
              </span>
              <div className="min-w-0">
                <div className="truncate text-base font-bold">
                  تأكيد عملية التحويل
                </div>
                <div className="text-[11px] text-white/70">
                  {isInternal
                    ? 'تحويل داخلي بين الحسابات'
                    : 'تحويل خارجي لطرف آخر'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="shrink-0 rounded-lg bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50"
              title="إغلاق"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative mt-4 text-center">
            <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
              المبلغ
            </div>
            <div
              className="mt-1 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_16px_rgba(255,255,255,0.35)]"
              dir="ltr"
            >
              {formatCurrency(amount)}
            </div>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-white/30" />
          </div>

          <div className="relative mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/70">
            <CalendarDays size={13} />
            {formatDate(new Date())}
          </div>
        </div>

        {/* Transfer path */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Landmark size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-gray-500">من حساب</div>
              <div className="truncate text-sm font-bold text-gray-900">
                {fromAccount}
              </div>
              {fromBank ? (
                <div className="truncate text-xs text-gray-400">{fromBank}</div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowDown size={15} />
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              {isInternal ? <Landmark size={18} /> : <User size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-gray-500">
                {isInternal ? 'إلى حساب' : 'إلى'}
              </div>
              <div className="truncate text-sm font-bold text-gray-900">
                {toAccount}
              </div>
              {toBank ? (
                <div className="truncate text-xs text-gray-400">{toBank}</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes ? (
          <div className="mx-5 mt-4 flex gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 p-3.5">
            <StickyNote size={16} className="shrink-0 text-amber-500" />
            <div className="min-w-0">
              <div className="text-[11px] text-amber-600">ملاحظات</div>
              <div className="text-sm text-gray-800">{notes}</div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-center gap-1.5 px-5 text-xs text-gray-400">
          <ShieldCheck size={13} />
          راجع البيانات جيدًا قبل التأكيد
        </div>

        {/* Actions */}
        <div className="space-y-2 p-5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="w-full rounded-2xl bg-primary py-3 text-base font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? 'جاري إرسال الطلب...' : 'تأكيد التحويل'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-full rounded-2xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TransferConfirmModal;
