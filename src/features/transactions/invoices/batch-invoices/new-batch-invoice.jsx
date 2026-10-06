// New batch invoice page.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgePercent,
  FileText,
  Percent,
  Search,
  Users,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import PageLoader from '../../../../shared/ui/page-loader';
import Table from '../../../../shared/ui/table';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import { toast } from '../../../../shared/lib/toast';
import {
  useFinancialPeriods,
} from '../shared/hooks/invoices.queries';
import { useCreateBatchInvoice } from '../shared/hooks/invoices.mutations';
import { invoicesKeys } from '../shared/hooks/invoices.keys';
import { getBatchByNumber } from '../shared/api/invoices-api';
import { toDateInputValue } from '../shared/utils/mapInvoiceToFormValues';
import { formatCurrency, formatNumber } from '../shared/utils/format-currency';
import {
  DISCOUNT_SOURCE_OPTIONS,
  buildFinanceDiscountPayload,
  initializeDiscountRows,
  updateFinanceDiscount,
} from './batch-discounts';

const createEmptyBatchForm = () => ({
  batchID: null,
  batchNumber: '',
  supplierID: '',
  supplierName: '',
  batchAmount: 0,
  financialPeriodID: '',
  invoiceDate: '',
  dueDate: '',
  discounts: [],
  details: [],
  summary: null,
});

const toAmount = (value) => Number(value) || 0;

const DETAIL_AMOUNT_FIELDS = [
  'totalBeforeCopayment',
  'copayment',
  'paidByMember',
  'totalAfterCopayment',
  'totalAfterRevision',
  'earnedDiscount',
  'totalAmount',
];

const SUMMARY_FIELDS = ['claimsCount', ...DETAIL_AMOUNT_FIELDS];

const DETAIL_HEADERS = {
  totalBeforeCopayment: 'قبل التحمل',
  copayment: 'التحمل',
  paidByMember: 'مدفوع من العميل',
  totalAfterCopayment: 'بعد التحمل',
  totalAfterRevision: 'بعد المراجعة',
  earnedDiscount: 'الخصم المكتسب',
  totalAmount: 'الصافي',
};

const formatAmount = (value) => formatNumber(value, { maximumFractionDigits: 2 });

const DetailTextCell = ({ children, className = '', title }) => (
  <div className={`line-clamp-2 wrap-break-word whitespace-normal ${className}`} title={title}>
    {children}
  </div>
);

const DetailNumberCell = ({ children }) => (
  <div className="whitespace-nowrap">{children}</div>
);

const DETAIL_COLUMNS = [
  {
    header: 'كود العميل',
    key: 'clientCode',
    type: 'custom',
    render: (row) => (
      <DetailTextCell
        className="max-w-36 text-gray-600"
        title={row.clientCode}
      >
        {row.clientCode}
      </DetailTextCell>
    ),
  },
  {
    header: 'اسم العميل',
    key: 'clientName',
    type: 'custom',
    render: (row) => (
      <DetailTextCell
        className="min-w-32 max-w-[16rem] font-medium text-gray-900"
        title={row.clientName}
      >
        {row.clientName}
      </DetailTextCell>
    ),
  },
  {
    header: 'المطالبات',
    key: 'claimsCount',
    isSummary: true,
    type: 'custom',
    render: (row) => (
      <DetailNumberCell>{formatNumber(row.claimsCount)}</DetailNumberCell>
    ),
  },
  ...DETAIL_AMOUNT_FIELDS.map((key) => ({
    header: DETAIL_HEADERS[key],
    key,
    isSummary: true,
    type: 'custom',
    render: (row) => (
      <DetailNumberCell>{formatAmount(row[key])}</DetailNumberCell>
    ),
  })),
];

const mapBatchDetail = (detail) => ({
  batchDetailID: detail.batchDetailID ?? null,
  clientId: detail.clientId ?? detail.clientID ?? null,
  clientCode:
    detail.clientCode ??
    (detail.clientId ?? detail.clientID) != null
      ? String(detail.clientId ?? detail.clientID)
      : '-',
  clientName:
    detail.customerName ||
    detail.clientName ||
    detail.clientNameAr ||
    detail.clientNameEn ||
    '-',
  claimsCount: toAmount(detail.claimsCount),
  totalBeforeCopayment: toAmount(detail.totalBeforeCopayment),
  copayment: toAmount(detail.copayment),
  paidByMember: toAmount(detail.paidByMember),
  totalAfterCopayment: toAmount(detail.totalAfterCopayment),
  totalAfterRevision: toAmount(detail.totalAfterRevision),
  earnedDiscount: toAmount(detail.earnedDiscount),
  totalAmount: toAmount(detail.totalAmount),
});

const sumDetails = (details) =>
  SUMMARY_FIELDS.reduce(
    (acc, field) => ({
      ...acc,
      [field]: details.reduce((sum, detail) => sum + toAmount(detail[field]), 0),
    }),
    {}
  );

const resolveSummary = (summary, details) => {
  const hasServerSummary =
    summary && SUMMARY_FIELDS.some((field) => summary[field] != null);

  if (!hasServerSummary) {
    return details.length > 0 ? sumDetails(details) : null;
  }

  return SUMMARY_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field]: toAmount(summary[field]) }),
    {}
  );
};

const buildDetailsFooter = (summary) => (visibleColumns) => {
  if (!summary) {
    return null;
  }

  const cells = [];
  let labelSpan = 0;

  visibleColumns.forEach((col) => {
    if (col.isSummary) {
      if (labelSpan > 0) {
        cells.push({ type: 'label', colSpan: labelSpan });
        labelSpan = 0;
      }
      cells.push({ type: 'value', value: formatAmount(summary[col.key]) });
      return;
    }

    labelSpan += 1;
  });

  if (labelSpan > 0) {
    cells.push({ type: 'label', colSpan: labelSpan });
  }

  return (
    <tr>
      {cells.map((cell, index) =>
        cell.type === 'label' ? (
          <td
            key={`label-${index}`}
            colSpan={cell.colSpan}
            className="p-3 text-center bg-main text-white text-base font-medium"
          >
            الإجمالي
          </td>
        ) : (
          <td key={`value-${index}`} className="bg-main text-white text-base font-medium p-3 text-center">
            {cell.value}
          </td>
        )
      )}
    </tr>
  );
};

const TABS = [
  { key: 'info', label: 'بيانات الدفعة', icon: FileText },
  { key: 'details', label: 'تفاصيل الدفعة', icon: Users, countKey: 'details' },
  {
    key: 'discounts',
    label: 'الخصومات',
    icon: Percent,
    countKey: 'discounts',
  },
];

const getDefaultFinancialPeriodId = (periods) => {
  if (!Array.isArray(periods) || periods.length === 0) return '';
  const open = periods.filter((period) => period?.isActive && !period?.isClosed);
  const pool = open.length > 0 ? open : periods;
  const sorted = [...pool].sort(
    (a, b) => new Date(b?.startDate ?? 0) - new Date(a?.startDate ?? 0)
  );
  const id = sorted[0]?.financialPeriodID ?? sorted[0]?.id;
  return id != null ? String(id) : '';
};

const mapBatchToFormData = (batch) => {
  const details = (batch.clients ?? batch.details ?? []).map(mapBatchDetail);
  const providerValue = batch.providerId ?? batch.supplierID;
  const summary = resolveSummary(batch.summary, details);
  const bases = {
    netAmount: summary?.totalAmount ?? details.reduce((sum, detail) => sum + toAmount(detail.totalAmount), 0),
    beforeCopayment: summary?.totalBeforeCopayment ?? details.reduce((sum, detail) => sum + toAmount(detail.totalBeforeCopayment), 0),
  };
  // Match finance discount types to the corresponding batch percentages.
  const financePercentages = {
    1: batch.adminFees,
    2: batch.taxes,
  };
  const discounts = initializeDiscountRows(batch.batchDiscounts).map((row) => {
    if (!row.isFinance) return row;
    const percentage = financePercentages[row.type];
    if (percentage == null || percentage === '') return row;
    return updateFinanceDiscount(row, 'percentage', String(percentage), bases);
  });

  return {
    batchID: batch.batchID ?? null,
    batchNumber: String(batch.batchNumber ?? ''),
    supplierID: providerValue ? String(providerValue) : '',
    supplierName: batch.supplierName ?? '',
    batchAmount: toAmount(batch.amount ?? summary?.totalBeforeCopayment),
    financialPeriodID: batch.financialPeriodID
      ? String(batch.financialPeriodID)
      : '',
    invoiceDate: toDateInputValue(batch.batchDate),
    dueDate: toDateInputValue(batch.batchDate),
    discounts,
    details,
    summary,
  };
};

const DiscountsTab = ({ discounts, onDiscountChange }) => {
  const withIndex = discounts.map((discount, index) => ({ ...discount, index }));
  const batchDiscounts = withIndex.filter((discount) => !discount.isFinance);
  const financeDiscounts = withIndex.filter((discount) => discount.isFinance);

  if (discounts.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400">
            <BadgePercent size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">لا توجد خصومات</h2>
            <p className="mt-1 text-sm text-gray-500">لم يتم إضافة خصومات لهذه الدفعة بعد.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      <section aria-label="خصومات الدفعة" className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <FileText size={17} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-900">خصومات الدفعة</h3>
              <p className="text-xs text-gray-500">المبالغ الواردة من الدفعة</p>
            </div>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">للعرض فقط</span>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-4">
          {batchDiscounts.map((discount) => (
            <div
              key={discount.discountType}
              className="group rounded-xl border border-gray-200 bg-linear-to-b from-gray-50/80 to-white px-4 py-3 transition-colors hover:border-sky-200"
            >
              <p className="truncate text-xs font-medium text-gray-500" title={discount.discountType}>
                {discount.discountType}
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900 tabular-nums">
                {formatCurrency(toAmount(discount.amount))}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="خصومات المالية" className="overflow-hidden rounded-2xl border border-primary/20 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 bg-primary/4 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Percent size={17} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-900">خصومات المالية</h3>
              <p className="text-xs text-gray-500">
                أدخل النسبة أو القيمة واختر مصدر الاحتساب
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">قابل للتعديل</span>
        </div>
        <div className="space-y-4 bg-linear-to-b from-primary/2 to-white p-5">
          {financeDiscounts.map((discount) => (
            <div
              key={discount.discountType}
              className="rounded-xl border border-gray-200 bg-white p-4 focus-within:border-primary/40"
            >
              <h4 className="mb-3 text-sm font-bold text-gray-900">{discount.discountType}</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormInput
                  label="النسبة (%)"
                  aria-label={`نسبة ${discount.discountType}`}
                  type="number"
                  min="0"
                  step="any"
                  value={discount.percentage}
                  inputClass="py-2.5 tabular-nums"
                  onChange={(event) => onDiscountChange(discount.index, 'percentage', event.target.value)}
                />
                <FormInput
                  label="قيمة الخصم"
                  aria-label={`قيمة ${discount.discountType}`}
                  type="number"
                  min="0"
                  step="any"
                  value={discount.amount}
                  inputClass="py-2.5 tabular-nums font-semibold"
                  onChange={(event) => onDiscountChange(discount.index, 'amount', event.target.value)}
                  placeholder="0.00"
                />
                <FormInput
                  as="select"
                  label="مصدر الاحتساب"
                  aria-label={`مصدر احتساب ${discount.discountType}`}
                  value={discount.source}
                  inputClass="py-2.5"
                  onChange={(event) => onDiscountChange(discount.index, 'source', event.target.value)}
                >
                  {DISCOUNT_SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </FormInput>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const NewBatchInvoicePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createBatchInvoiceMutation = useCreateBatchInvoice();
  const { data: financialPeriods = [] } = useFinancialPeriods();

  const [batchNumberInput, setBatchNumberInput] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [formData, setFormData] = useState(createEmptyBatchForm);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const [batchLoadError, setBatchLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  // Default to the latest open financial period (e.g. 2026) once loaded.
  useEffect(() => {
    if (!financialPeriods.length) return;
    setFormData((prev) => {
      if (prev.financialPeriodID) return prev;
      const id = getDefaultFinancialPeriodId(financialPeriods);
      if (!id) return prev;
      return { ...prev, financialPeriodID: id };
    });
  }, [financialPeriods]);

  const totalAmount = useMemo(
    () =>
      formData.summary
        ? formData.summary.totalAmount
        : formData.details.reduce(
            (sum, detail) => sum + (Number(detail.totalAmount) || 0),
            0
          ),
    [formData.details, formData.summary]
  );

  const batchDiscountAmount = useMemo(
    () =>
      formData.discounts.reduce(
        (sum, discount) =>
          sum + (!discount.isFinance ? Number(discount.amount) || 0 : 0),
        0
      ),
    [formData.discounts]
  );
  const financeDiscountAmount = useMemo(
    () =>
      formData.discounts.reduce(
        (sum, discount) =>
          sum + (discount.isFinance ? Number(discount.amount) || 0 : 0),
        0
      ),
    [formData.discounts]
  );
  const netAmount = Math.max(totalAmount - financeDiscountAmount, 0);

  const periodOptions = useMemo(
    () =>
      financialPeriods.map((period) => ({
        value: String(period.financialPeriodID),
        label: period.nameAr || period.financialPeriodNameAr || period.nameEn,
      })),
    [financialPeriods]
  );

  const canSubmit =
    (Number(formData.batchID) > 0 || Boolean(formData.batchNumber)) &&
    Boolean(formData.supplierName?.trim()) &&
    Number(formData.financialPeriodID) > 0 &&
    Boolean(formData.invoiceDate) &&
    Boolean(formData.dueDate) &&
    formData.details.length > 0 &&
    formData.details.every((detail) => Number(detail.totalAmount) >= 0);

  const handleLoadBatch = async (event) => {
    event.preventDefault();
    if (isLoadingBatch) return;

    const normalizedBatchNumber = batchNumberInput.trim();
    if (!normalizedBatchNumber) {
      toast.error('أدخل رقم الدفعة أولاً');
      return;
    }

    setIsLoadingBatch(true);
    setBatchData(null);
    setFormData(createEmptyBatchForm());
    setActiveTab('info');
    setBatchLoadError(null);

    try {
      const response = await queryClient.fetchQuery({
        queryKey: invoicesKeys.batch(normalizedBatchNumber),
        queryFn: () => getBatchByNumber(normalizedBatchNumber),
        staleTime: 0,
        retry: false,
      });

      const batch = response && Object.hasOwn(response, 'data')
        ? response.data
        : response;
      if (
        !batch ||
        typeof batch !== 'object' ||
        (!batch.batchNumber && !(Number(batch.batchID) > 0))
      ) {
        setBatchLoadError({ type: 'not-found', batchNumber: normalizedBatchNumber });
        return;
      }

      const nextFormData = mapBatchToFormData(batch);
      if (!nextFormData.financialPeriodID) {
        const defaultPeriodId = getDefaultFinancialPeriodId(financialPeriods);
        if (defaultPeriodId) nextFormData.financialPeriodID = defaultPeriodId;
      }
      setBatchData(batch);
      setFormData(nextFormData);
      setBatchNumberInput(String(batch.batchNumber ?? normalizedBatchNumber));
      toast.success('تم تحميل بيانات الدفعة');
    } catch (error) {
      console.error('Error loading batch:', error);
      setBatchData(null);
      setFormData(createEmptyBatchForm());
      setBatchLoadError({
        type: error.response?.status === 404 ? 'not-found' : 'error',
        batchNumber: normalizedBatchNumber,
      });
    } finally {
      setIsLoadingBatch(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDiscountChange = (index, field, value) => {
    setFormData((prev) => {
      if (!prev.discounts[index]?.isFinance) return prev;
      const discounts = [...prev.discounts];
      discounts[index] = updateFinanceDiscount(discounts[index], field, value, {
        netAmount: totalAmount,
        beforeCopayment: prev.summary?.totalBeforeCopayment ??
          prev.details.reduce((sum, detail) => sum + toAmount(detail.totalBeforeCopayment), 0),
      });
      return { ...prev, discounts };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error('أكمل بيانات الفاتورة قبل التأكيد');
      return;
    }

    const payload = {
      batchNumber: formData.batchNumber,
      date: new Date(formData.invoiceDate).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      financialPeriod: Number(formData.financialPeriodID),
      totalAmount: Math.max(
        Number((totalAmount - financeDiscountAmount).toFixed(2)),
        0
      ),
      discount: buildFinanceDiscountPayload(formData.discounts),
    };

    try {
      await createBatchInvoiceMutation.mutateAsync(payload);
      navigate('/batches-invoices');
    } catch (error) {
      console.error('Error creating batch invoice:', error);
    }
  };

  return (
    <div className="min-h-screen space-y-6 p-6 md:p-10">
      <Breadcrumb
        items={[
          { label: 'فواتير المطالبات', to: '/batches-invoices' },
          { label: 'إنشاء فاتورة دفعة' },
        ]}
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              إنشاء فاتورة دفعة
            </h1>
            <p className="text-sm text-gray-600">
              أدخل رقم الدفعة لتحميل بياناتها ثم عدّل القيم قبل التأكيد
            </p>
          </div>
        </div>

        <form
          onSubmit={handleLoadBatch}
          className="flex w-full flex-col gap-3 md:w-auto md:flex-row"
        >
          <FormInput
            label="رقم الدفعة"
            value={batchNumberInput}
            onChange={(event) => setBatchNumberInput(event.target.value)}
            placeholder="مثال: 3990"
            containerClass="md:min-w-[420px]"
          />

          <button
            type="submit"
            disabled={isLoadingBatch}
            className="mt-0 w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-white hover:bg-primary/90 disabled:opacity-60 md:self-end"
          >
            <Search size={16} />
            {isLoadingBatch ? 'جاري التحميل...' : 'تحميل'}
          </button>
        </form>
      </div>

      {isLoadingBatch ? (
        <PageLoader label="جاري تحميل بيانات الدفعة..." />
      ) : null}

      {!isLoadingBatch && batchLoadError ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center"
        >
          <Search size={40} className="text-gray-400" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900">
            {batchLoadError.type === 'not-found'
              ? 'الدفعة غير موجودة'
              : 'تعذر تحميل بيانات الدفعة'}
          </h2>
          <p className="text-sm text-gray-600">
            {batchLoadError.type === 'not-found'
              ? `لم يتم العثور على دفعة برقم ${batchLoadError.batchNumber}. تحقق من الرقم وحاول مرة أخرى.`
              : 'حدث خطأ أثناء تحميل الدفعة. حاول مرة أخرى.'}
          </p>
        </div>
      ) : null}

      {batchData ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">عدد المطالبات</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatNumber(formData.summary?.claimsCount ?? 0)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">قيمة الدفعة</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(formData.batchAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">خصم المطالبه</p>
              <p className="mt-2 text-lg font-semibold text-red-500">
                {formatCurrency(batchDiscountAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">إجمالي التفاصيل</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">الخصم الماليه</p>
              <p className="mt-2 text-lg font-semibold text-red-500">
                {formatCurrency(financeDiscountAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">المستحق</p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>

          {batchData.invoiceID ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              هذه الدفعة مرتبطة بالفعل بفاتورة رقم{' '}
              <span className="font-semibold">{batchData.invoiceNumber}</span>.
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-3">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const count = tab.countKey
                  ? formData[tab.countKey].length
                  : null;

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
                    {count !== null ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {formatNumber(count)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 'info' ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormInput
                    label="رقم الدفعة"
                    value={formData.batchNumber}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                  />

                  <FormInput
                    label="المورد"
                    value={formData.supplierName}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                    placeholder="اسم المورد"
                  />

                  <FormInput
                    label="تاريخ الدفعة"
                    value={toDateInputValue(batchData.batchDate)}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                  />

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      الفترة المالية
                    </label>
                    <SearchableSelect
                      value={formData.financialPeriodID}
                      onChange={(event) =>
                        handleFieldChange('financialPeriodID', event.target.value)
                      }
                      options={periodOptions}
                      placeholder="اختر الفترة المالية"
                    />
                  </div>

                  <FormInput
                    type="date"
                    label="تاريخ الفاتورة"
                    value={formData.invoiceDate}
                    onChange={(event) =>
                      handleFieldChange('invoiceDate', event.target.value)
                    }
                  />

                  <FormInput
                    type="date"
                    label="تاريخ الاستحقاق"
                    value={formData.dueDate}
                    onChange={(event) =>
                      handleFieldChange('dueDate', event.target.value)
                    }
                  />
                </div>
              ) : null}

              {activeTab === 'details' ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      تفاصيل الدفعة
                    </h2>
                    <p className="text-sm text-gray-500">
                      بيانات العملاء كما وردت من الدفعة
                    </p>
                  </div>

                  <div className="rounded-x">
                    <Table
                      columns={DETAIL_COLUMNS}
                      data={formData.details}
                      footer={buildDetailsFooter(formData.summary)}
                      emptyMessage="لا توجد تفاصيل لعرضها"
                    />
                  </div>
                </div>
              ) : null}

              {activeTab === 'discounts' ? (
                <DiscountsTab
                  discounts={formData.discounts}
                  onDiscountChange={handleDiscountChange}
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/batches-invoices')}
              className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={!canSubmit || createBatchInvoiceMutation.isPending}
              className="rounded-xl bg-primary px-6 py-3 text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {createBatchInvoiceMutation.isPending
                ? 'جاري إنشاء الفاتورة...'
                : 'تأكيد وإنشاء الفاتورة'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
};

export default NewBatchInvoicePage;
