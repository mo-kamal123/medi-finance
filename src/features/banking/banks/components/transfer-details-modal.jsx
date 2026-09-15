import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  ExternalLink,
  Landmark,
  Lock,
  User,
  X,
  XCircle,
} from 'lucide-react';
import ConfirmModal from '../../../../shared/ui/modal';
import PageLoader from '../../../../shared/ui/page-loader';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';
import { useBankTransfer } from '../hooks/banks.queries';
import {
  useApproveBankTransfer,
  useCancelBankTransfer,
} from '../hooks/banks.mutations';

const STATUS_LABELS = {
  Draft: 'مسودة',
  Posted: 'معتمدة',
  Reconciled: 'مطابقة',
  Cancelled: 'ملغاة',
};

const TRANSFER_TYPE_LABELS = {
  Internal: 'تحويل داخلي',
  External: 'تحويل خارجي',
};

const PARTY_TYPE_LABELS = {
  Customer: 'عميل',
  Supplier: 'مورد',
};

const Card = ({ title, children }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
    {title ? (
      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
        {title}
      </h3>
    ) : null}
    <div className="space-y-2">{children}</div>
  </div>
);

const DetailRow = ({ label, value, ltr }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
    <span className="text-sm text-gray-500">{label}</span>
    <span
      className="text-sm font-medium text-gray-900"
      dir={ltr ? 'ltr' : undefined}
    >
      {value || '-'}
    </span>
  </div>
);

const TransferDetailsModal = ({ open, transferId, onClose }) => {
  const navigate = useNavigate();
  const [approveOpen, setApproveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { data, isLoading, isError } = useBankTransfer(open ? transferId : null);
  const { mutate: approveTransfer, isPending: approving } =
    useApproveBankTransfer();
  const { mutate: cancelTransfer, isPending: cancelling } =
    useCancelBankTransfer();

  if (!open) return null;

  const isApprovable =
    data?.status !== 'Posted' &&
    data?.status !== 'Reconciled' &&
    data?.status !== 'Cancelled';
  const isCancellable = data?.status !== 'Cancelled';

  const handleApprove = () => {
    if (!data) return;
    approveTransfer(data.bankTransferID);
    setApproveOpen(false);
  };

  const handleCancel = () => {
    if (!data) return;
    cancelTransfer({
      id: data.bankTransferID,
      cancelReason,
    });
    setCancelReason('');
    setCancelOpen(false);
  };

  const content = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[300px] items-center justify-center">
          <PageLoader label="جاري تحميل بيانات التحويل..." />
        </div>
      );
    }

    if (isError || !data) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-gray-500">تعذر تحميل بيانات التحويل.</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-primary underline"
          >
            إغلاق
          </button>
        </div>
      );
    }

    const typeLabel =
      TRANSFER_TYPE_LABELS[data.transferType] ||
      data.transferTypeName ||
      data.transferType;

    return (
      <>
        <div className="space-y-4 p-5">
          {/* Header */}
          <div className="rounded-3xl bg-linear-to-br from-primary via-primary/85 to-primary/70 px-6 py-5 text-white shadow-lg shadow-primary/20">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                {STATUS_LABELS[data.status] || data.statusName || data.status}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
              >
                <X size={15} />
                إغلاق
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <ArrowLeftRight size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-bold">{typeLabel}</h1>
                  <span
                    dir="ltr"
                    className="shrink-0 rounded-md bg-white/15 px-2 py-0.5 text-[11px] text-white/80"
                  >
                    {data.transferNumber}
                  </span>
                </div>
                <div className="mt-1 text-xs text-white/70">
                  {formatDate(data.transferDate)}
                </div>
              </div>
              <div className="shrink-0 text-left">
                <div className="text-[11px] text-white/70">المبلغ</div>
                <div
                  className="mt-0.5 text-xl font-bold tracking-tight"
                  dir="ltr"
                >
                  {formatCurrency(data.amount)}{' '}
                  <span className="text-sm font-semibold text-white/80">
                    {data.currencyName || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isApprovable ? (
              <button
                type="button"
                onClick={() => setApproveOpen(true)}
                disabled={approving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                {approving ? 'جاري الاعتماد...' : 'اعتماد التحويل'}
              </button>
            ) : null}
            {isCancellable ? (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                disabled={cancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
              >
                <XCircle size={16} />
                {cancelling ? 'جاري الإلغاء...' : 'إلغاء التحويل'}
              </button>
            ) : null}
          </div>

          {/* Transfer path */}
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-stretch gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Landmark size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500">من حساب</div>
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {data.fromBankNameAr || '-'}
                  </div>
                  <div className="truncate text-xs text-gray-400" dir="ltr">
                    {data.bankAccountName}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-center">
                <ArrowLeft size={18} className="text-gray-400" />
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  {data.transferType === 'Internal' ? (
                    <Landmark size={19} />
                  ) : (
                    <User size={19} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500">
                    {data.transferType === 'Internal' ? 'إلى حساب' : 'إلى'}
                  </div>
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {data.transferType === 'Internal'
                      ? data.toBankNameAr || '-'
                      : `${PARTY_TYPE_LABELS[data.partyType] || data.partyType || 'طرف'}${
                          data.partyName ? ` - ${data.partyName}` : ''
                        }`}
                  </div>
                  {data.toBankAccountName ? (
                    <div className="truncate text-xs text-gray-400" dir="ltr">
                      {data.toBankAccountName}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Operation details */}
          <Card title="تفاصيل العملية">
            <DetailRow label="نوع التحويل" value={typeLabel} />
            <DetailRow
              label="الحالة"
              value={
                STATUS_LABELS[data.status] || data.statusName || data.status
              }
            />
            <DetailRow
              label="القيد اليومي"
              value={
                data.journalEntryID ? (
                  <span className="inline-flex items-center gap-2" dir="ltr">
                    <button
                      type="button"
                      onClick={() => navigate(`/entries/${data.journalEntryID}`)}
                      title="عرض تفاصيل القيد"
                      className="text-main inline-flex cursor-pointer font-semibold justify-center items-center gap-2"
                    >
                      <ExternalLink size={15} />
                      {data.journalEntryNumber || `قيد ${data.journalEntryID}`}
                    </button>
                  </span>
                ) : (
                  '-'
                )
              }
            />
            <DetailRow label="البيان" value={data.descriptionAr} />
            {data.cancelReason ? (
              <DetailRow label="سبب الإلغاء" value={data.cancelReason} />
            ) : null}
          </Card>

        </div>

        <ConfirmModal
          isOpen={approveOpen}
          onClose={() => setApproveOpen(false)}
          onConfirm={handleApprove}
          title="اعتماد التحويل"
          description={`هل أنت متأكد من اعتماد التحويل "${data.transferNumber}"؟`}
          confirmText="نعم، اعتماد"
          cancelText="إلغاء"
          isLoading={approving}
          loadingText="جاري الاعتماد..."
          confirmClassName="bg-emerald-600 hover:bg-emerald-700"
        />

        <ConfirmModal
          isOpen={cancelOpen}
          onClose={() => {
            if (!cancelling) {
              setCancelOpen(false);
              setCancelReason('');
            }
          }}
          onConfirm={handleCancel}
          title="إلغاء التحويل"
          description={`هل أنت متأكد من إلغاء التحويل "${data.transferNumber}"؟ يجب إدخال سبب الإلغاء.`}
          confirmText="نعم، إلغاء"
          cancelText="تراجع"
          isLoading={cancelling}
          loadingText="جاري الإلغاء..."
          disabled={!cancelReason.trim()}
        >
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="سبب الإلغاء"
            rows={3}
            className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </ConfirmModal>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto">{content()}</div>
      </div>
    </div>
  );
};

export default TransferDetailsModal;