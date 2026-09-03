import { useCallback, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CreditCard,
  FileText,
  ListChecks,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react';
import PageLoader from '../../../../shared/ui/page-loader';
import Dropdown from '../../../../shared/ui/dropdown';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import ChequeForm from '../components/cheque-form';
import { useCheque, useChequeStatuses } from '../hooks/cheques.queries';
import {
  useUpdateChequeStatus,
  useUpdateCheque,
} from '../hooks/cheques.mutations';

const TABS = [
  { key: 'info', label: 'بيانات الشيك', icon: FileText },
  { key: 'accounts', label: 'الحسابات', icon: CalendarDays },
  { key: 'settings', label: 'الخصائص والملاحظات', icon: Settings },
];

const statusClass = (statusName) => {
  const normalized = String(statusName || '')
    .trim()
    .toLowerCase();
  if (
    normalized.includes('مرتجع') ||
    normalized.includes('return') ||
    normalized.includes('bounce') ||
    normalized.includes('refus')
  ) {
    return 'bg-red-100 text-red-700';
  }
  if (
    normalized.includes('محصل') ||
    normalized.includes('collect') ||
    normalized === 'collected'
  ) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (
    normalized.includes('متردد') ||
    normalized.includes('نقد') ||
    normalized.includes('reten')
  ) {
    return 'bg-amber-100 text-amber-700';
  }
  if (
    normalized.includes('استلام') ||
    normalized.includes('receiv') ||
    normalized.includes('تحصيل') ||
    normalized.includes('collect')
  ) {
    return 'bg-sky-100 text-sky-700';
  }
  return 'bg-white/20 text-white';
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
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [entriesOpen, setEntriesOpen] = useState(false);
  const statusBtnRef = useRef(null);

  const statusOptions = useMemo(
    () =>
      (Array.isArray(statuses) ? statuses : []).map((s) => ({
        value: String(s.id ?? s.Id ?? s.statusID ?? s.statusId),
        label: s.NameAr || s.nameAr || s.Name || s.name || '',
      })),
    [statuses]
  );

  const currentStatusLabel =
    data?.statusNameAr || data?.status || 'حالة غير معروفة';

  const entries = useMemo(() => (data ? relatedEntries(data) : []), [data]);

  const handleStatusChange = useCallback(
    (statusID) => {
      setStatusMenuOpen(false);
      if (!statusID) return;
      updateStatus(
        { id: Number(id), statusID: Number(statusID) },
        { onSuccess: () => refetch() }
      );
    },
    [id, updateStatus, refetch]
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
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-linear-to-r from-primary to-primary/80 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <CreditCard size={26} />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{title}</h1>
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

            <div className="flex items-center gap-2">
              {/* Entries button */}
              <button
                type="button"
                onClick={() => setEntriesOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-base font-medium text-white transition-colors hover:bg-white/30 disabled:opacity-60"
              >
                <ListChecks size={16} />
                القيود
              </button>
              {/* Status dropdown */}
              <div className="relative" ref={statusBtnRef}>
                <button
                  type="button"
                  onClick={() => setStatusMenuOpen((prev) => !prev)}
                  disabled={isStatusUpdating}
                  className="flex items-center gap-2 rounded-xl bg-white/20 px-2 py-1 text-base font-medium text-white transition-colors hover:bg-white/30 disabled:opacity-60"
                >
                  {isStatusUpdating ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : null}
                  <span
                    className={`inline-flex items-center rounded-lg p-1 font-semibold ${statusClass(currentStatusLabel)}`}
                  >
                    {currentStatusLabel}
                  </span>
                  <ChevronDown size={16} />
                </button>
                <Dropdown
                  isOpen={statusMenuOpen}
                  onClose={() => setStatusMenuOpen(false)}
                  anchorRef={statusBtnRef}
                >
                  {statusOptions.length > 0 ? (
                    statusOptions.map((option, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleStatusChange(option.value)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        {option.label}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      لا توجد حالات
                    </div>
                  )}
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
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
    </div>
  );
};

export default ChequeDetails;
