import { useCallback, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CreditCard,
  FileText,
  ListChecks,
  Paperclip,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react';
import PageLoader from '../../../../shared/ui/page-loader';
import Dropdown from '../../../../shared/ui/dropdown';
import {
  getNextChequeStatus,
  getChequeStatusAction,
} from '../utils/cheque-status';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import ChequeForm from '../components/cheque-form';
import ChequeAttachmentModal from '../components/cheque-attachment-modal';
import { useCheque, useChequeStatuses } from '../hooks/cheques.queries';
import {
  useUpdateChequeStatus,
  useUpdateCheque,
} from '../hooks/cheques.mutations';

const TABS = [
  { key: 'info', label: 'بيانات الشيك', icon: FileText },
  { key: 'settings', label: 'الخصائص والملاحظات', icon: Settings },
];

const statusClass = (statusName) => {
  const normalized = String(statusName || '')
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ');
  const colors = {
    'تم الاستلام': 'bg-sky-100 text-sky-800',
    'تحت التحصيل': 'bg-amber-100 text-amber-800',
    'تم التحصيل': 'bg-emerald-100 text-emerald-800',
    'تم الاصدار': 'bg-violet-100 text-violet-800',
    'تم الصرف': 'bg-blue-100 text-blue-800',
    مرفوض: 'bg-red-100 text-red-800',
    مرتد: 'bg-orange-100 text-orange-800',
  };
  return colors[normalized] || 'bg-gray-100 text-gray-800';
};

const relatedEntries = (cheque) => {
  const defs = [
    { key: 'Receipt', label: 'قيد الاستلام' },
    { key: 'Deposit', label: 'قيد الإيداع' },
    { key: 'Collected', label: 'قيد التحصيل' },
    { key: 'Reversal', label: 'قيد الإرجاع' },
  ];
  return defs
    .map((def) => {
      const id = cheque?.[`journalEntryID_${def.key}`];
      const number = cheque?.[`journalEntryNumber_${def.key}`];
      return {
        type: def.label,
        id,
        number,
        isPosted: cheque?.isPosted ?? false,
        postedAt: cheque?.postedAt,
      };
    })
    .filter((entry) => entry.id);
};

const EntryStatusBadge = ({ isPosted }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
      isPosted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
    }`}
  >
    {isPosted ? 'مرحّل' : 'غير مرحّل'}
  </span>
);

const EntriesModal = ({ open, onClose, entries }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">
            القيود المرتبطة بالشيك
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
              <ListChecks size={32} />
              <p className="text-sm">لا توجد قيود مرتبطة بهذا الشيك</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/entries/${entry.id}`);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                      <ListChecks size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {entry.number || `قيد ${entry.id}`}
                      </div>
                      <div className="text-xs text-gray-500">{entry.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <EntryStatusBadge isPosted={entry.isPosted} />
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChequeDetails = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useCheque(id);
  const rawType = String(data?.transactionType ?? '');
  const chequeType = rawType === 'PAYMENT' || rawType === '1' ? 1 : 0;
  const { data: statuses = [] } = useChequeStatuses(chequeType);
  const { mutate: updateCheque, isPending } = useUpdateCheque();
  const { mutate: updateStatus, isPending: isStatusUpdating } =
    useUpdateChequeStatus();
  const [activeTab, setActiveTab] = useState('info');
  const [entriesOpen, setEntriesOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const returnButtonRef = useRef(null);

  const statusOptions = useMemo(
    () =>
      (Array.isArray(statuses) ? statuses : []).map((s) => ({
        value: String(s.id ?? s.Id ?? s.statusID ?? s.statusId),
        label: s.NameAr || s.nameAr || s.Name || s.name || '',
      })),
    [statuses]
  );

  const currentStatusLabel =
    statusOptions.find(
      (option) =>
        option.value ===
        String(data?.statusID ?? data?.statusId ?? data?.status)
    )?.label ||
    data?.statusNameAr ||
    data?.status ||
    'حالة غير معروفة';
  const nextStatus = getNextChequeStatus(statusOptions, data, chequeType);
  const requiresReason =
    nextStatus &&
    ['إرجاع', 'رفض'].includes(getChequeStatusAction(nextStatus.label));
  const isRejectAction =
    nextStatus && getChequeStatusAction(nextStatus.label) === 'رفض';

  const entries = useMemo(() => (data ? relatedEntries(data) : []), [data]);

  const handleStatusChange = useCallback(
    (statusID, reason) => {
      if (!statusID || isStatusUpdating) return;
      if (requiresReason && !reason?.trim()) return;
      updateStatus(
        {
          id: Number(id),
          statusID: Number(statusID),
          ...(requiresReason ? { returnReason: reason.trim() } : {}),
        },
        {
          onSuccess: () => {
            setReturnOpen(false);
            setReturnReason('');
            refetch();
          },
        }
      );
    },
    [id, updateStatus, refetch, isStatusUpdating, requiresReason]
  );

  if (isLoading) {
    return <PageLoader label="جاري تحميل بيانات الشيك..." />;
  }

  if (!data) {
    return <div className="p-6 text-center text-gray-500">لا توجد بيانات.</div>;
  }

  const handleEditSubmit = (formData) => {
    updateCheque(
      { id: Number(id), ...formData },
      { onSuccess: () => refetch() }
    );
  };

  const title = data.chequeNumber || `شيك ${id}`;
  const partyName =
    data.partyNameAr || data.customerNameAr || data.supplierNameAr;
  const subtitleParts = [data.bankNameAr, data.transactionTypeNameAr].filter(
    Boolean
  );

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[{ label: 'الشيكات', to: '/cheques' }, { label: title }]}
      />

      {/* Header */}
      <div className="overflow-hidden rounded-2xl">
        <div className="bg-linear-to-r from-primary to-primary/80 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <CreditCard size={26} />
              </div>
              <div className="text-white">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{title}</h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ' +
                        statusClass(currentStatusLabel)
                      }
                    >
                      {currentStatusLabel}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-white/80 flex flex-wrap items-center gap-x-2">
                  {partyName ? (
                    <span className="font-medium">{partyName}</span>
                  ) : null}
                  {subtitleParts.map((part) => (
                    <span key={part} className="flex items-center gap-1">
                      <span className="text-white/40">•</span>
                      {part}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex max-w-full items-center gap-3 overflow-x-auto whitespace-nowrap py-1">
              <div className="flex shrink-0 items-center gap-3">
                {nextStatus && (
                  <button
                    type="button"
                    ref={returnButtonRef}
                    onClick={() =>
                      requiresReason
                        ? setReturnOpen((open) => !open)
                        : handleStatusChange(nextStatus.value)
                    }
                    aria-expanded={requiresReason ? returnOpen : undefined}
                    disabled={isStatusUpdating}
                    aria-label={'تغيير الحالة إلى ' + nextStatus.label}
                    className={
                      'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60 ' +
                      statusClass(nextStatus.label)
                    }
                  >
                    {isStatusUpdating
                      ? 'جاري تغيير الحالة...'
                      : getChequeStatusAction(nextStatus.label)}
                      {isStatusUpdating && (
                        <RefreshCw size={16} className="animate-spin" />
                      )}
                  </button>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2 border-s border-white/20 ps-3">
                <button
                  type="button"
                  onClick={() => setAttachmentOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Paperclip size={16} />
                  المرفقات
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-white/15 px-1 text-xs tabular-nums">
                    {data.attachment ? 1 : 0}
                  </span>
                </button>
                {/* Entries button */}
                <button
                  type="button"
                  onClick={() => setEntriesOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ListChecks size={16} />
                  القيود
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-white/15 px-1 text-xs tabular-nums">
                    {entries.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dropdown
        isOpen={returnOpen && Boolean(requiresReason)}
        onClose={() => {
          if (!isStatusUpdating) setReturnOpen(false);
        }}
        anchorRef={returnButtonRef}
        width={320}
      >
        <form
          className="space-y-4 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleStatusChange(nextStatus?.value, returnReason);
          }}
        >
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {isRejectAction ? 'رفض الشيك' : 'إرجاع الشيك'}
            </h2>
            <label
              htmlFor="cheque-return-reason"
              className="mb-2 mt-3 block text-sm font-medium text-gray-700"
            >
              {isRejectAction ? 'سبب الرفض' : 'سبب الإرجاع'}{' '}
              <span className="text-red-600">*</span>
            </label>
            <textarea
              id="cheque-return-reason"
              value={returnReason}
              onChange={(event) => setReturnReason(event.target.value)}
              placeholder={
                isRejectAction ? 'اكتب سبب رفض الشيك' : 'اكتب سبب إرجاع الشيك'
              }
              required
              autoFocus
              disabled={isStatusUpdating}
              rows={3}
              className="w-full resize-y rounded-lg border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isStatusUpdating}
              onClick={() => setReturnOpen(false)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-60"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isStatusUpdating || !returnReason.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStatusUpdating && (
                <RefreshCw size={14} className="animate-spin" />
              )}
              {isStatusUpdating
                ? 'جاري الحفظ...'
                : isRejectAction
                  ? 'رفض الشيك'
                  : 'إرجاع الشيك'}
            </button>
          </div>
        </form>
      </Dropdown>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-4 pt-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-base font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <ChequeForm
            defaultValues={data}
            mode="edit"
            isPending={isPending}
            onSubmit={handleEditSubmit}
            activeTab={activeTab}
          />
        </div>
      </div>

      <EntriesModal
        open={entriesOpen}
        onClose={() => setEntriesOpen(false)}
        entries={entries}
      />
      {attachmentOpen && (
        <ChequeAttachmentModal
          chequeId={id}
          chequeNumber={title}
          attachment={data.attachment}
          onClose={() => setAttachmentOpen(false)}
        />
      )}
    </div>
  );
};

export default ChequeDetails;
