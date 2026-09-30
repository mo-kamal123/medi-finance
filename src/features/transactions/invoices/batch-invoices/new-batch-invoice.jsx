// New batch invoice page.

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Beaker,
  FileText,
  Percent,
  Plus,
  Search,
  Trash2,
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
  useCustomers,
  useFinancialPeriods,
  useSuppliers,
} from '../shared/hooks/invoices.queries';
import { useCreateBatchInvoice } from '../shared/hooks/invoices.mutations';
import { invoicesKeys } from '../shared/hooks/invoices.keys';
import { getBatchByNumber } from '../shared/api/invoices-api';
import { toDateInputValue } from '../shared/utils/mapInvoiceToFormValues';
import { formatCurrency, formatNumber } from '../shared/utils/format-currency';

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
  <div className={`line-clamp-2 break-words whitespace-normal ${className}`} title={title}>
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
        className="max-w-[9rem] text-gray-600"
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
        className="min-w-[8rem] max-w-[16rem] font-medium text-gray-900"
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

const DISCOUNT_TYPE_OPTIONS = [
  'خصم طبي',
  'خصم فني',
  'فروق أسعار التعاقد',
  'فروق التحمل والخصم',
  'إجمالي الخصومات',
  'خصم مكتسب -مراجعه فنية',
  'خصم مسموح بة',
  'ايراد خصم ادارة فنية',
  'خصم مكتسب',
  'خصم مكتسب - تعاقدات',
  'خصم من المنبع',
  'خصم اضافى موردين',
  'خصم مشتريات',
  'Earned Discount - Technical Review',
  'Allowed Discount',
  'Technical Management Discount Revenue',
  'Earned Discount',
  'Earned Discount - Contracts',
  'Discount at Source',
  'Additional Supplier Discount',
  'Purchase Discount',
].map((item) => ({
  value: item,
  label: item,
}));

const BATCH_DISCOUNT_FIELDS = [
  { key: 'medicalDiscount', label: 'خصم طبي' },
  { key: 'technicalDiscount', label: 'خصم فني' },
  { key: 'contractPriceDifferences', label: 'فروق أسعار التعاقد' },
  { key: 'copaymentAndDiscountDifferences', label: 'فروق التحمل والخصم' },
];

const mapBatchDiscounts = (batchDiscounts, earnedDiscount) => {
  if (batchDiscounts) {
    const componentRows = BATCH_DISCOUNT_FIELDS
      .map(({ key, label }) => ({
        discountType: label,
        amount: toAmount(batchDiscounts[key]),
      }))
      .filter((row) => row.amount > 0);

    if (componentRows.length > 0) {
      return componentRows;
    }

    const totalDiscounts = toAmount(batchDiscounts.totalDiscounts);
    return totalDiscounts > 0
      ? [{ discountType: 'إجمالي الخصومات', amount: totalDiscounts }]
      : [];
  }

  const earned = toAmount(earnedDiscount);
  return earned > 0 ? [{ discountType: 'خصم مكتسب', amount: earned }] : [];
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

const createEmptyDiscount = () => ({
  discountType: '',
  amount: '',
});

const TEST_BATCH_NUMBER = '9999';

const round2 = (value) => Math.round(value * 100) / 100;

const TEST_BATCH_CLIENTS = [
  {
    clientId: 175,
    clientCode: '2164',
    clientName: 'Galala University',
    claimsCount: 1,
    totalBeforeCopayment: 1386.4,
    copayment: 138.64,
    paidByMember: 0.36,
    revisionDelta: 0,
    earnedDiscount: 0,
  },
  {
    clientId: 182,
    clientCode: '2087',
    clientName: 'مستشفى النور التخصصي',
    claimsCount: 3,
    totalBeforeCopayment: 4210.75,
    copayment: 421.08,
    paidByMember: 12.5,
    revisionDelta: 150,
    earnedDiscount: 25,
  },
  {
    clientId: 193,
    clientCode: '1912',
    clientName: 'مؤسسة المستقبل للتجارة',
    claimsCount: 7,
    totalBeforeCopayment: 12890.2,
    copayment: 1289.02,
    paidByMember: 45.75,
    revisionDelta: 320,
    earnedDiscount: 0,
  },
  {
    clientId: 204,
    clientCode: '1745',
    clientName: 'شركة النيل للتوزيع',
    claimsCount: 2,
    totalBeforeCopayment: 2760.4,
    copayment: 276.04,
    paidByMember: 8.2,
    revisionDelta: 0,
    earnedDiscount: 40,
  },
  {
    clientId: 211,
    clientCode: '1630',
    clientName: 'مصنع الأمل للصلب',
    claimsCount: 12,
    totalBeforeCopayment: 34210.9,
    copayment: 3421.09,
    paidByMember: 118.4,
    revisionDelta: 640,
    earnedDiscount: 120,
  },
  {
    clientId: 226,
    clientCode: '1508',
    clientName: 'مؤسسة الفجر للتجارة',
    claimsCount: 4,
    totalBeforeCopayment: 5930.15,
    copayment: 593.02,
    paidByMember: 21.6,
    revisionDelta: 90,
    earnedDiscount: 0,
  },
];

const expandTestDetail = (row, index) => {
  const totalAfterCopayment = round2(row.totalBeforeCopayment - row.copayment);
  const earnedDiscount = round2(row.earnedDiscount);
  const totalAfterRevision = round2(totalAfterCopayment - row.revisionDelta);

  return {
    batchDetailID: 9000 + index,
    clientId: row.clientId,
    clientCode: row.clientCode,
    clientName: row.clientName,
    claimsCount: row.claimsCount,
    totalBeforeCopayment: round2(row.totalBeforeCopayment),
    copayment: round2(row.copayment),
    paidByMember: round2(row.paidByMember),
    totalAfterCopayment,
    totalAfterRevision,
    earnedDiscount,
    totalAmount: round2(totalAfterRevision - earnedDiscount - row.paidByMember),
  };
};

const buildTestBatchDetails = (customers) => {
  const list = (Array.isArray(customers) ? customers : []).filter(
    (customer) => customer?.customerID || customer?.id
  );

  if (list.length === 0) {
    return TEST_BATCH_CLIENTS.map(expandTestDetail);
  }

  return list.slice(0, TEST_BATCH_CLIENTS.length).map((customer, index) => {
    const sample = TEST_BATCH_CLIENTS[index];
    const clientId = customer.customerID ?? customer.id;

    return expandTestDetail(
      {
        ...sample,
        clientId,
        clientCode: customer.accountCode || sample.clientCode,
        clientName:
          customer.clientName || customer.customerNameAr || sample.clientName,
      },
      index
    );
  });
};


const createTestBatch = ({ supplier, period, customers }) => {
  const details = buildTestBatchDetails(customers);
  const technicalDiscount = round2(
    details.reduce((sum, detail) => sum + detail.earnedDiscount, 0)
  );

  return {
    batchID: 9001,
    batchNumber: TEST_BATCH_NUMBER,
    providerId: supplier?.supplierID ?? null,
    supplierName:
      supplier?.supplierNameAr ?? supplier?.supplierNameEn ?? null,
    financialPeriodID: period?.financialPeriodID ?? null,
    batchDate: new Date().toISOString(),
    amount: round2(
      details.reduce((sum, detail) => sum + detail.totalBeforeCopayment, 0)
    ),
    batchDiscounts: {
      medicalDiscount: 0,
      technicalDiscount,
      contractPriceDifferences: round2(technicalDiscount / 20),
      copaymentAndDiscountDifferences: 0,
      totalDiscounts: technicalDiscount,
    },
    invoiceID: null,
    clients: details,
    summary: sumDetails(details),
  };
};

const mapBatchToFormData = (batch) => {
  const details = (batch.clients ?? batch.details ?? []).map(mapBatchDetail);
  const providerValue = batch.providerId ?? batch.supplierID;
  const summary = resolveSummary(batch.summary, details);

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
    discounts: mapBatchDiscounts(batch.batchDiscounts, batch.earnedDiscount),
    details,
    summary,
  };
};

const NewBatchInvoicePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createBatchInvoiceMutation = useCreateBatchInvoice();
  const { data: suppliers = [] } = useSuppliers();
  const { data: customers = [] } = useCustomers();
  const { data: financialPeriods = [] } = useFinancialPeriods();

  const [batchNumberInput, setBatchNumberInput] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [formData, setFormData] = useState(createEmptyBatchForm);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

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

  const discountAmount = useMemo(
    () =>
      formData.discounts.reduce(
        (sum, discount) => sum + (Number(discount.amount) || 0),
        0
      ),
    [formData.discounts]
  );
  const netAmount = Math.max(totalAmount - discountAmount, 0);

  const supplierOptions = useMemo(() => {
    const baseOptions = suppliers.map((supplier) => ({
      value: String(supplier.supplierID),
      label: supplier.supplierNameAr || supplier.supplierNameEn,
    }));

    const batchSupplierValue = String(
      batchData?.providerId ?? batchData?.supplierID ?? ''
    );

    if (!batchSupplierValue || batchSupplierValue === 'undefined') {
      return baseOptions;
    }

    const hasBatchSupplier = baseOptions.some(
      (option) => option.value === batchSupplierValue
    );

    if (hasBatchSupplier) {
      return baseOptions;
    }

    return [
      {
        value: batchSupplierValue,
        label:
          batchData.supplierName ||
          batchData.supplierNameAr ||
          batchData.supplierNameEn ||
          batchData.supplierCode ||
          batchSupplierValue,
      },
      ...baseOptions,
    ];
  }, [batchData, suppliers]);

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
    Number(formData.supplierID) > 0 &&
    Number(formData.financialPeriodID) > 0 &&
    Boolean(formData.invoiceDate) &&
    Boolean(formData.dueDate) &&
    formData.details.length > 0 &&
    formData.details.every((detail) => Number(detail.totalAmount) >= 0);

  const handleLoadBatch = async () => {
    const normalizedBatchNumber = batchNumberInput.trim();
    if (!normalizedBatchNumber) {
      toast.error('أدخل رقم الدفعة أولاً');
      return;
    }

    setIsLoadingBatch(true);

    try {
      const response = await queryClient.fetchQuery({
        queryKey: invoicesKeys.batch(normalizedBatchNumber),
        queryFn: () => getBatchByNumber(normalizedBatchNumber),
      });

      const batch = response?.data ?? response;
      setBatchData(batch);
      setFormData(mapBatchToFormData(batch));
      setBatchNumberInput(String(batch.batchNumber ?? normalizedBatchNumber));
      toast.success('تم تحميل بيانات الدفعة');
    } catch (error) {
      console.error('Error loading batch:', error);
      toast.error('تعذر تحميل بيانات الدفعة');
    } finally {
      setIsLoadingBatch(false);
    }
  };

  const handleLoadTestBatch = () => {
    const batch = createTestBatch({
      supplier: suppliers[0],
      period: financialPeriods[0],
      customers,
    });

    setBatchData(batch);
    setFormData(mapBatchToFormData(batch));
    setBatchNumberInput(String(batch.batchNumber));
    toast.success('تم تحميل بيانات الدفعة التجريبية');
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addDiscountRow = () => {
    setFormData((prev) => ({
      ...prev,
      discounts: [...prev.discounts, createEmptyDiscount()],
    }));
  };

  const removeDiscountRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleDiscountChange = (index, field, value) => {
    setFormData((prev) => {
      const discounts = [...prev.discounts];
      discounts[index] = {
        ...discounts[index],
        [field]: value,
      };
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
      batchID: Number(formData.batchID) || 0,
      batchNumber: formData.batchNumber,
      supplierID: Number(formData.supplierID),
      financialPeriodID: Number(formData.financialPeriodID),
      invoiceDate: new Date(formData.invoiceDate).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      totalAmount,
      discountAmount,
      netAmount,
      details: formData.details.map((detail) => ({
        batchDetailID: detail.batchDetailID,
        clientId: Number(detail.clientId) || 0,
        claimsCount: Number(detail.claimsCount) || 0,
        totalAmount: Number(detail.totalAmount) || 0,
      })),
      discounts: formData.discounts
        .filter(
          (discount) =>
            discount.discountType && Number(discount.amount || 0) > 0
        )
        .map((discount) => ({
          discountType: discount.discountType,
          amount: Number(discount.amount) || 0,
        })),
      installments: [],
      createdBy: 'ms',
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

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <FormInput
            label="رقم الدفعة"
            value={batchNumberInput}
            onChange={(event) => setBatchNumberInput(event.target.value)}
            placeholder="مثال: 3990"
            containerClass="md:min-w-[420px]"
          />

          <button
            type="submit"
            onClick={handleLoadBatch}
            disabled={isLoadingBatch}
            className="mt-0 w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-white hover:bg-primary/90 disabled:opacity-60 md:self-end"
          >
            <Search size={16} />
            {isLoadingBatch ? 'جاري التحميل...' : 'تحميل'}
          </button>

          <button
            type="button"
            onClick={handleLoadTestBatch}
            className="mt-0 w-full flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 text-primary hover:bg-primary/10 md:self-end"
          >
            <Beaker size={16} />
           تجريبية
          </button>
        </div>
      </div>

      {isLoadingBatch ? (
        <PageLoader label="جاري تحميل بيانات الدفعة..." />
      ) : null}

      {batchData ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
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
              <p className="text-sm text-gray-500">إجمالي التفاصيل</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">الخصم</p>
              <p className="mt-2 text-lg font-semibold text-red-500">
                {formatCurrency(discountAmount)}
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

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      المورد
                    </label>
                    <SearchableSelect
                      value={formData.supplierID}
                      onChange={(event) =>
                        handleFieldChange('supplierID', event.target.value)
                      }
                      options={supplierOptions}
                      placeholder="اختر المورد"
                    />
                  </div>

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
                    label="تاريخ الدفعة"
                    value={toDateInputValue(batchData.batchDate)}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                  />

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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        الخصومات
                      </h2>
                      <p className="text-sm text-gray-500">
                        خصومات الدفعة كما وردت من الخادم، يمكن تعديلها قبل الإرسال
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addDiscountRow}
                      className="flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-white hover:bg-primary/90"
                    >
                      <Plus size={16} />
                      إضافة خصم
                    </button>
                  </div>

                  {formData.discounts.length > 0 ? (
                    <div className="space-y-3">
                      {formData.discounts.map((discount, index) => (
                        <div
                          key={`${discount.discountType}-${index}`}
                          className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[minmax(0,1fr)_180px_56px]"
                        >
                          <SearchableSelect
                            value={discount.discountType}
                            onChange={(event) =>
                              handleDiscountChange(
                                index,
                                'discountType',
                                event.target.value
                              )
                            }
                            options={DISCOUNT_TYPE_OPTIONS}
                            placeholder="اختر نوع الخصم"
                          />

                          <FormInput
                            type="number"
                            value={discount.amount}
                            onChange={(event) =>
                              handleDiscountChange(
                                index,
                                'amount',
                                event.target.value
                              )
                            }
                            placeholder="قيمة الخصم"
                          />

                          <button
                            type="button"
                            onClick={() => removeDiscountRow(index)}
                            className="flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                            aria-label="حذف الخصم"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                      لم يتم إضافة خصومات بعد
                    </div>
                  )}
                </div>
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
