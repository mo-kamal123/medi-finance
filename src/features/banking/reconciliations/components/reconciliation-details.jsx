import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  EyeOff,
  Landmark,
  Link2,
  Unlink,
  Flag,
  Wallet,
  Scale,
} from 'lucide-react';
import PageLoader from '../../../../shared/ui/page-loader';
import Table from '../../../../shared/ui/table';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import FormInput from '../../../../shared/ui/input';
import ConfirmModal from '../../../../shared/ui/modal';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';
import { getErrorMessage, toast } from '../../../../shared/lib/toast';
import {
  useBankReconciliation,
  useReconciliationItems,
} from '../hooks/bank-reconciliations.queries';
import {
  useFinalizeReconciliation,
  useIgnoreReconciliationItem,
  useMatchReconciliationItem,
  useUnmatchReconciliationItem,
} from '../hooks/bank-reconciliations.mutations';

const getItemId = (item) =>
  item?.id ?? item?.itemId ?? item?.itemID ?? item?.reconciliationItemId ?? item?.reconciliationItemID;

const getItemStatusKey = (item) =>
  item?.status ?? item?.statusCode ?? item?.statusName ?? '';

const getItemStatusName = (item) =>
  item?.statusName ?? item?.status ?? item?.statusCode ?? '-';

const STATUS_STYLES = {
  Matched: 'bg-emerald-100 text-emerald-700',
  UnmatchedBankTransaction: 'bg-amber-100 text-amber-700',
  OutstandingSystemTransaction: 'bg-sky-100 text-sky-700',
  Adjusted: 'bg-violet-100 text-violet-700',
  Ignored: 'bg-gray-200 text-gray-600',
};

const STATUS_LABELS = {
  Matched: 'مطابق',
  Reconciled: 'معتمدة',
  InProgress: 'جارية',
  Draft: 'مسودة',
  Cancelled: 'ملغي',
  UnmatchedBankTransaction: 'حركة بنك غير مطابقة',
  OutstandingSystemTransaction: 'حركة سيستم معلقة',
  Adjusted: 'معدل',
  Ignored: 'متجاهل',
};

const GROUP_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'Matched', label: 'مطابق' },
  { key: 'UnmatchedBankTransaction', label: 'حركات بنك غير مطابقة' },
  { key: 'OutstandingSystemTransaction', label: 'حركات سيستم معلقة' },
  { key: 'Ignored', label: 'متجاهل' },
];

const getBankTx = (item) =>
  item?.bankTransaction ?? item?.bankStatementTransaction ?? item?.statementTransaction ?? null;

const getSystemTx = (item) =>
  item?.systemTransaction ?? item?.matchedTransaction ?? item?.bankSystemTransaction ?? null;

const getItemAmount = (item) =>
  item?.amount ?? getBankTx(item)?.amount ?? getSystemTx(item)?.amount ?? 0;

const SummaryCard = ({ label, value, accent = false, danger = false }) => (
  <div
    className={`rounded-xl border p-4 ${
      danger
        ? 'border-red-200 bg-red-50'
        : accent
          ? 'border-primary/30 bg-primary/5'
          : 'border-gray-200 bg-gray-50'
    }`}
  >
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p
      className={`mt-1 text-lg font-bold ${
        danger ? 'text-red-600' : accent ? 'text-primary' : 'text-gray-900'
      }`}
    >
      {value}
    </p>
  </div>
);

const ReconciliationDetails = ({ reconciliationId, onBack }) => {
  const [groupTab, setGroupTab] = useState('all');
  const [matchTarget, setMatchTarget] = useState(null);
  const [ignoreTarget, setIgnoreTarget] = useState(null);
  const [unmatchTarget, setUnmatchTarget] = useState(null);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [matchBankTxId, setMatchBankTxId] = useState('');
  const [ignoreNotes, setIgnoreNotes] = useState('');

  const {
    data: details,
    isLoading: detailsLoading,
    isError: detailsError,
    error: detailsErrObj,
    refetch: refetchDetails,
  } = useBankReconciliation(reconciliationId);
  const {
    data: itemsRes,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = useReconciliationItems(reconciliationId);

  const items = useMemo(() => {
    if (Array.isArray(itemsRes) && itemsRes.length > 0) return itemsRes;
    const embedded = details?.items ?? details?.Items ?? [];
    return Array.isArray(embedded) ? embedded : [];
  }, [itemsRes, details]);

  const matchMutation = useMatchReconciliationItem(reconciliationId);
  const unmatchMutation = useUnmatchReconciliationItem(reconciliationId);
  const ignoreMutation = useIgnoreReconciliationItem(reconciliationId);
  const finalizeMutation = useFinalizeReconciliation();

  const difference = Number(
    details?.difference ?? details?.Difference ?? 0
  );
  const status = details?.status ?? details?.statusCode ?? '';
  const statusName = details?.statusName ?? details?.status ?? '-';
  const isClosed =
    status === 'Reconciled' ||
    status === 'Cancelled' ||
    statusName === 'Reconciled' ||
    statusName === 'Cancelled';
  const canFinalize = !isClosed && difference === 0;

  const counts = useMemo(() => {
    const result = { all: items.length };
    items.forEach((item) => {
      const key = getItemStatusKey(item);
      result[key] = (result[key] ?? 0) + 1;
    });
    return result;
  }, [items]);

  const visibleItems = useMemo(() => {
    if (groupTab === 'all') return items;
    if (groupTab === 'Ignored') {
      return items.filter((item) => {
        const key = getItemStatusKey(item);
        return key === 'Ignored' || key === 'Adjusted';
      });
    }
    return items.filter((item) => getItemStatusKey(item) === groupTab);
  }, [items, groupTab]);

  const unmatchedBankOptions = useMemo(
    () =>
      items
        .filter((item) => getItemStatusKey(item) === 'UnmatchedBankTransaction')
        .map((item) => {
          const bankTx = getBankTx(item);
          const bankTxId =
            bankTx?.id ?? bankTx?.bankTransactionId ?? bankTx?.bankTransactionID ?? getItemId(item);
          const label = [
            bankTx?.reference ?? item?.reference,
            bankTx?.description ?? item?.description,
            formatCurrency(bankTx?.amount ?? item?.amount ?? 0),
          ]
            .filter(Boolean)
            .join(' · ');
          return { value: String(bankTxId), label: label || `حركة ${bankTxId}` };
        }),
    [items]
  );

  const isMatched = (item) => {
    const key = getItemStatusKey(item);
    return key === 'Matched' || key === 'Adjusted';
  };
  const isIgnored = (item) => getItemStatusKey(item) === 'Ignored';

  const itemColumns = useMemo(
    () => [
      {
        header: 'حركة كشف البنك',
        key: 'bankTx',
        type: 'custom',
        render: (item) => {
          const bankTx = getBankTx(item);
          if (!bankTx && !item?.reference && !item?.description)
            return <span className="text-xs text-gray-400">-</span>;
          return (
            <div className="space-y-0.5 text-xs text-right">
              <p className="font-semibold text-gray-800">
                {bankTx?.description ?? item?.description ?? '-'}
              </p>
              <p className="text-gray-500">
                {bankTx?.reference ?? item?.reference ?? ''}
                {bankTx?.externalReference || item?.externalReference
                  ? ` · ${bankTx?.externalReference ?? item?.externalReference}`
                  : ''}
              </p>
              <p className="text-gray-500">
                {formatDate(bankTx?.transactionDate ?? item?.transactionDate)}
              </p>
            </div>
          );
        },
      },
      {
        header: 'حركة السيستم',
        key: 'systemTx',
        type: 'custom',
        render: (item) => {
          const systemTx = getSystemTx(item);
          if (!systemTx) return <span className="text-xs text-gray-400">-</span>;
          return (
            <div className="space-y-0.5 text-xs text-right">
              <p className="font-semibold text-gray-800">
                {systemTx?.description ?? systemTx?.transactionNumber ?? '-'}
              </p>
              <p className="text-gray-500">
                {systemTx?.referenceNumber ?? systemTx?.reference ?? ''}
              </p>
              <p className="text-gray-500">
                {formatDate(systemTx?.transactionDate)}
              </p>
            </div>
          );
        },
      },
      {
        header: 'المبلغ',
        key: 'amount',
        type: 'custom',
        render: (item) => (
          <span className="font-semibold" dir="ltr">
            {formatCurrency(getItemAmount(item))}
          </span>
        ),
      },
      {
        header: 'الفرق',
        key: 'difference',
        type: 'custom',
        render: (item) => (
          <span
            className={`font-semibold ${
              Number(item?.difference ?? 0) !== 0
                ? 'text-red-600'
                : 'text-gray-500'
            }`}
            dir="ltr"
          >
            {formatCurrency(item?.difference ?? 0)}
          </span>
        ),
      },
      {
        header: 'الحالة',
        key: 'status',
        type: 'custom',
        render: (item) => {
          const key = getItemStatusKey(item);
          return (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                STATUS_STYLES[key] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {STATUS_LABELS[key] || getItemStatusName(item)}
            </span>
          );
        },
      },
      {
        header: 'طريقة المطابقة',
        key: 'matchMethod',
        type: 'custom',
        render: (item) => (
          <span className="text-xs text-gray-600">
            {item?.matchMethodName ?? item?.matchMethod ?? '-'}
          </span>
        ),
      },
      {
        header: 'طابق بواسطة / بتاريخ',
        key: 'matchedBy',
        type: 'custom',
        render: (item) => (
          <span className="text-xs text-gray-600">
            {item?.matchedBy ? <p>{item.matchedBy}</p> : null}
            {item?.matchedAt ? <p>{formatDate(item.matchedAt)}</p> : null}
            {!item?.matchedBy && !item?.matchedAt ? '-' : null}
          </span>
        ),
      },
      {
        header: 'ملاحظات',
        key: 'notes',
        type: 'custom',
        render: (item) => (
          <span className="text-xs text-gray-600">{item?.notes ?? '-'}</span>
        ),
      },
      {
        header: 'إجراءات',
        key: 'actions',
        type: 'custom',
        render: (item) => (
          <div className="flex items-center justify-center gap-1.5">
            {!isMatched(item) && !isIgnored(item) ? (
              <button
                type="button"
                title="مطابقة يدوية"
                onClick={() => {
                  setMatchTarget(item);
                  setMatchBankTxId('');
                }}
                className="rounded-lg p-2 text-primary hover:bg-primary/10"
              >
                <Link2 size={16} />
              </button>
            ) : null}
            {isMatched(item) ? (
              <button
                type="button"
                title="إلغاء المطابقة"
                onClick={() => setUnmatchTarget(item)}
                className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
              >
                <Unlink size={16} />
              </button>
            ) : null}
            {!isMatched(item) && !isIgnored(item) ? (
              <button
                type="button"
                title="تجاهل البند"
                onClick={() => {
                  setIgnoreTarget(item);
                  setIgnoreNotes('');
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <EyeOff size={16} />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    []
  );

  if (detailsLoading) return <PageLoader label="جاري تحميل التسوية..." />;

  if (detailsError || !details) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-600">
          {getErrorMessage(detailsErrObj, 'تعذر تحميل تفاصيل التسوية')}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm"
        >
          رجوع للقائمة
        </button>
      </div>
    );
  }

  const statistics = details?.statistics ?? details?.stats ?? null;

  const handleConfirmMatch = async () => {
    if (!matchTarget || !matchBankTxId) {
      toast.error('اختر حركة البنك أولاً');
      return;
    }
    try {
      await matchMutation.mutateAsync({
        itemId: getItemId(matchTarget),
        bankTransactionId: Number(matchBankTxId),
      });
      setMatchTarget(null);
      setMatchBankTxId('');
      refetchItems();
      refetchDetails();
    } catch {
      /* toast handled in mutation */
    }
  };

  const handleConfirmUnmatch = async () => {
    if (!unmatchTarget) return;
    try {
      await unmatchMutation.mutateAsync(getItemId(unmatchTarget));
      setUnmatchTarget(null);
      refetchItems();
      refetchDetails();
    } catch {
      /* toast handled in mutation */
    }
  };

  const handleConfirmIgnore = async () => {
    if (!ignoreTarget) return;
    try {
      await ignoreMutation.mutateAsync({
        itemId: getItemId(ignoreTarget),
        notes: ignoreNotes,
      });
      setIgnoreTarget(null);
      setIgnoreNotes('');
      refetchItems();
      refetchDetails();
    } catch {
      /* toast handled in mutation */
    }
  };

  const handleConfirmFinalize = async () => {
    try {
      await finalizeMutation.mutateAsync(reconciliationId);
      setFinalizeOpen(false);
      refetchDetails();
      refetchItems();
    } catch {
      /* toast handled in mutation (API message as-is) */
    }
  };

  const recId =
    details?.reconciliationID ?? details?.reconciliationId ?? reconciliationId;
  const accountTitle =
    details?.bankAccountName ??
    details?.accountNameAr ??
    `تسوية رقم ${recId}`;
  const subtitleParts = [
    details?.bankNameAr,
    details?.accountNumber
      ? `حساب ${details.accountNumber}`
      : null,
    details?.currencyName,
  ].filter(Boolean);

  const headerStatusClass = (() => {
    if (status === 'Reconciled') return 'bg-emerald-100 text-emerald-700';
    if (status === 'InProgress' || status === 'Draft')
      return 'bg-amber-100 text-amber-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700';
    if (status === 'Matched') return 'bg-sky-100 text-sky-700';
    return 'bg-white/20 text-white';
  })();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl">
        <div className="bg-linear-to-r from-primary to-primary/80 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <Scale size={26} />
              </div>
              <div className="text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{accountTitle}</h1>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${headerStatusClass}`}
                  >
                    {STATUS_LABELS[status] || statusName}
                  </span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-white/80">
                  <span className="font-medium">تسوية رقم {recId}</span>
                  {subtitleParts.map((part) => (
                    <span key={part} className="flex items-center gap-1">
                      <span className="text-white/40">•</span>
                      {part}
                    </span>
                  ))}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 text-xs text-white/70">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} />
                    الفترة: {formatDate(details?.fromDate)} -{' '}
                    {formatDate(details?.toDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Landmark size={13} />
                    تاريخ الكشف: {formatDate(details?.statementDate)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/30"
              >
                <ArrowRight size={16} />
                رجوع للقائمة
              </button> */}
              <button
                type="button"
                onClick={() => setFinalizeOpen(true)}
                disabled={!canFinalize || finalizeMutation.isPending}
                title={
                  isClosed
                    ? 'التسوية مغلقة بالفعل'
                    : difference !== 0
                      ? 'لا يمكن الاعتماد قبل تصفير الفرق'
                      : 'اعتماد التسوية'
                }
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {finalizeMutation.isPending
                  ? 'جاري الاعتماد...'
                  : 'إنهاء / اعتماد التسوية'}
              </button>
            </div>
          </div>

          {/* Header balances strip */}
          {/* <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-white/15 px-4 py-3 text-white backdrop-blur-sm">
              <p className="flex items-center gap-1 text-xs text-white/70">
                <Wallet size={13} />
                رصيد الكشف
              </p>
              <p className="mt-1 text-lg font-bold" dir="ltr">
                {formatCurrency(
                  details?.bankStatementClosingBalance ??
                    details?.statementBalance ??
                    0
                )}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-3 text-white backdrop-blur-sm">
              <p className="text-xs text-white/70">رصيد الدفاتر</p>
              <p className="mt-1 text-lg font-bold" dir="ltr">
                {formatCurrency(details?.bookBalance ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-3 text-white backdrop-blur-sm">
              <p className="text-xs text-white/70">الرصيد المعدل</p>
              <p className="mt-1 text-lg font-bold" dir="ltr">
                {formatCurrency(details?.adjustedBalance ?? 0)}
              </p>
            </div>
            <div
              className={`rounded-xl px-4 py-3 backdrop-blur-sm ${
                difference !== 0
                  ? 'bg-red-500/30 text-white'
                  : 'bg-emerald-400/25 text-white'
              }`}
            >
              <p className="text-xs text-white/80">الفرق</p>
              <p className="mt-1 text-lg font-bold" dir="ltr">
                {formatCurrency(difference)}
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {/* <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-gray-900">ملخص التسوية</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {STATUS_LABELS[status] || statusName}
          </span>
        </div> */}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            label="رصيد كشف البنك الختامي"
            value={formatCurrency(details?.bankStatementClosingBalance ?? 0)}
            accent
          />
          <SummaryCard
            label="رصيد النظام الافتتاحي"
            value={formatCurrency(details?.systemOpeningBalance ?? 0)}
          />
          <SummaryCard
            label="رصيد النظام الختامي"
            value={formatCurrency(details?.systemClosingBalance ?? 0)}
          />
          <SummaryCard
            label="الرصيد المعدل"
            value={formatCurrency(details?.adjustedBalance ?? 0)}
            accent
          />
          <SummaryCard
            label="الفرق"
            value={formatCurrency(difference)}
            danger={difference !== 0}
          />
          <SummaryCard label="الحالة" value={STATUS_LABELS[status] || statusName} />
        </div>

        {/* <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
          <span>الفترة: {formatDate(details?.fromDate)} - {formatDate(details?.toDate)}</span>
          <span>تاريخ الكشف: {formatDate(details?.statementDate)}</span>
          {details?.currencyName ? <span>العملة: {details.currencyName}</span> : null}
          {details?.totalItems ?? details?.clearedAmount ? (
            <span>
              البنود: {details?.totalItems ?? items.length} · المبلغ المعتمد:{' '}
              {formatCurrency(details?.clearedAmount ?? 0)}
            </span>
          ) : null}
          {details?.reconciledBy ? (
            <span>
              اعتمدت بواسطة: {details.reconciledBy}
              {details?.reconciledAt ? ` - ${formatDate(details.reconciledAt)}` : ''}
            </span>
          ) : null}
          {details?.notes ? <span>ملاحظات: {details.notes}</span> : null}
        </div> */}

        {/* {statistics && typeof statistics === 'object' ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
            {Object.entries(statistics).map(([key, value]) => {
              const arKey =
                {
                  totalBankTransactions: 'إجمالي حركات البنك',
                  matchedTransactions: 'حركات مطابقة',
                  unmatchedBankTransactions: 'حركات بنك غير مطابقة',
                  outstandingSystemTransactions: 'حركات سيستم معلقة',
                }[key] ?? key;
              return (
                <span
                  key={key}
                  className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600"
                >
                  {arKey}:{' '}
                  <span className="font-semibold text-gray-900">
                    {String(value)}
                  </span>
                </span>
              );
            })}
          </div>
        ) : null} */}
      </div>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-2">
        {GROUP_TABS.map((tab) => {
          const isActive = groupTab === tab.key;
          const count = counts[tab.key] ?? (tab.key === 'all' ? items.length : 0);
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setGroupTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items table */}
      <div className="overflow-hidden rounded-xl">
        <Table
          columns={itemColumns}
          data={visibleItems}
          loading={itemsLoading}
          emptyMessage="لا توجد بنود في هذا القسم"
        />
      </div>

      {/* Manual match modal */}
      {matchTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-bold text-gray-900">
              <Link2 size={18} className="text-primary" />
              مطابقة يدوية
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              اختر حركة البنك غير المطابقة لمطابقتها مع هذا البند
            </p>
            <div className="mt-4">
              <SearchableSelect
                label="حركة البنك (bankTransactionId)"
                value={matchBankTxId}
                onChange={(e) => setMatchBankTxId(e.target.value)}
                options={unmatchedBankOptions}
                placeholder={
                  unmatchedBankOptions.length
                    ? 'اختر حركة البنك'
                    : 'لا توجد حركات بنك غير مطابقة'
                }
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setMatchTarget(null);
                  setMatchBankTxId('');
                }}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmMatch}
                disabled={matchMutation.isPending || !matchBankTxId}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {matchMutation.isPending ? 'جاري المطابقة...' : 'تأكيد المطابقة'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Ignore modal */}
      {ignoreTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-bold text-gray-900">
              <Flag size={18} className="text-gray-500" />
              تجاهل البند
            </h3>
            <div className="mt-4">
              <FormInput
                label="سبب التجاهل"
                as="textarea"
                value={ignoreNotes}
                onChange={(e) => setIgnoreNotes(e.target.value)}
                placeholder="اكتب سبب التجاهل"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIgnoreTarget(null);
                  setIgnoreNotes('');
                }}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmIgnore}
                disabled={ignoreMutation.isPending}
                className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {ignoreMutation.isPending ? 'جاري التجاهل...' : 'تأكيد التجاهل'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={!!unmatchTarget}
        onClose={() => setUnmatchTarget(null)}
        onConfirm={handleConfirmUnmatch}
        title="إلغاء المطابقة"
        description="هل أنت متأكد من إلغاء مطابقة هذا البند؟"
        confirmText="إلغاء المطابقة"
        cancelText="تراجع"
        isLoading={unmatchMutation.isPending}
        loadingText="جاري الإلغاء..."
        confirmClassName="bg-amber-600 hover:bg-amber-700"
      />

      <ConfirmModal
        isOpen={finalizeOpen}
        onClose={() => setFinalizeOpen(false)}
        onConfirm={handleConfirmFinalize}
        title="اعتماد التسوية"
        description={
          difference !== 0
            ? `لا يمكن الاعتماد: الفرق الحالي ${formatCurrency(difference)} ويجب أن يساوي صفر.`
            : 'هل أنت متأكد من اعتماد هذه التسوية؟ لن تتمكن من التعديل بعد الاعتماد.'
        }
        confirmText="اعتماد"
        cancelText="تراجع"
        isLoading={finalizeMutation.isPending}
        loadingText="جاري الاعتماد..."
        disabled={difference !== 0}
        confirmClassName="bg-emerald-600 hover:bg-emerald-700"
      />
    </div>
  );
};

export default ReconciliationDetails;
