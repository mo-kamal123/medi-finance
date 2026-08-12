import { useMemo, useState } from 'react';
import { Download, FileText, RotateCcw } from 'lucide-react';
import DateInput from '../../../shared/ui/date-input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import PageLoader from '../../../shared/ui/page-loader';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { useCustomers, useSuppliers } from '../../invoices/hooks/invoices.queries';
import {
  useAgingReport,
  useProviderClasses,
  useImportanceLevels,
  useSupplierStatuses,
  useCustomerCategories,
  useCustomerStatuses,
} from '../hooks/aging-report.queries';
import { useAgingReportExport } from '../hooks/use-aging-report-export';
import {
  DEFAULT_AGING_REPORT_FILTERS,
  buildAgingReportQueryParams,
} from '../utils/aging-report-filters.utils';

const SORT_BY_OPTIONS = [
  { value: '', label: 'بدون ترتيب' },
  { value: 'invoiceNumber', label: 'رقم الفاتورة' },
  { value: 'invoiceDate', label: 'تاريخ الفاتورة' },
  { value: 'dueDate', label: 'تاريخ الاستحقاق' },
  { value: 'netAmount', label: 'صافي الفاتورة' },
  { value: 'remainingAmount', label: 'المبلغ المتبقي' },
  { value: 'ageDays', label: 'العمر (أيام)' },
  { value: 'daysOverdue', label: 'أيام التأخير' },
];

const SORT_ORDER_OPTIONS = [
  { value: '', label: 'بدون ترتيب' },
  { value: 'asc', label: 'تصاعدي' },
  { value: 'desc', label: 'تنازلي' },
];

const getStatusBadge = (isOverdue) => {
  if (isOverdue) return 'bg-red-100 text-red-700';
  return 'bg-emerald-100 text-emerald-700';
};

const PARTY_TABS = [
  { value: 'Supplier', label: 'الموردين' },
  { value: 'Customer', label: 'العملاء' },
];

const AgingReportPage = () => {
  const [filters, setFilters] = useState(DEFAULT_AGING_REPORT_FILTERS);
  const { handleExport, isExporting } = useAgingReportExport();
  const isSupplier = filters.partyType === 'Supplier';

  const { data: customers = [] } = useCustomers();
  const { data: suppliers = [] } = useSuppliers();
  const { data: providerClasses = [] } = useProviderClasses();
  const { data: importanceLevels = [] } = useImportanceLevels();
  const { data: supplierStatuses = [] } = useSupplierStatuses();
  const { data: customerCategories = [] } = useCustomerCategories();
  const { data: customerStatuses = [] } = useCustomerStatuses();

  const queryParams = useMemo(
    () => buildAgingReportQueryParams(filters),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useAgingReport(queryParams);

  const reportData = response ?? {};
  const details = useMemo(() => reportData.details ?? [], [reportData.details]);
  const totalRows = details.length;

  const partyOptions = useMemo(() => {
    if (filters.partyType === 'Customer') {
      return customers.map((customer) => ({
        value: String(customer.customerID),
        label: customer.customerNameAr || customer.customerNameEn,
      }));
    }

    if (filters.partyType === 'Supplier') {
      return suppliers.map((supplier) => ({
        value: String(supplier.supplierID),
        label: supplier.supplierNameAr || supplier.supplierNameEn,
      }));
    }

    return [];
  }, [customers, filters.partyType, suppliers]);

  const providerClassOptions = useMemo(() => {
    return [
      { value: '', label: 'كل الفئات' },
      ...providerClasses.map((pc) => ({
        value: String(pc.id),
        label: pc.name,
      })),
    ];
  }, [providerClasses]);

  const importanceLevelOptions = useMemo(() => {
    return [
      { value: '', label: 'كل المستويات' },
      ...importanceLevels.map((l) => ({
        value: String(l.id),
        label: l.name,
      })),
    ];
  }, [importanceLevels]);

  const supplierStatusOptions = useMemo(() => {
    return [
      { value: '', label: 'كل الحالات' },
      ...supplierStatuses.map((s) => ({
        value: String(s.id),
        label: s.nameAr || s.name,
      })),
    ];
  }, [supplierStatuses]);

  const customerCategoryOptions = useMemo(() => {
    return [
      { value: '', label: 'كل التصنيفات' },
      ...customerCategories.map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    ];
  }, [customerCategories]);

  const customerStatusOptions = useMemo(() => {
    return [
      { value: '', label: 'كل الحالات' },
      ...customerStatuses.map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
    ];
  }, [customerStatuses]);

  const handleChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value, pageNumber: 1 };

      if (key === 'partyType') {
        next.partyId = '';
        next.providerClass = '';
        next.importanceLevel = '';
        next.partyStatus = '';
        next.category = '';
      }

      return next;
    });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const handlePageSizeChange = (value) => {
    setFilters((prev) => ({ ...prev, pageSize: value, pageNumber: 1 }));
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_AGING_REPORT_FILTERS });
  };

  const columns = useMemo(() => {
    const base = [
      { header: 'رقم الفاتورة', key: 'invoiceNumber' },
      { header: isSupplier ? 'المورد' : 'العميل', key: 'partyNameAr', type: 'custom', render: (row) => row.partyNameAr || row.partyNameEn || '-' },
      { header: isSupplier ? 'كود المورد' : 'كود العميل', key: 'partyCode' },
    ];

    if (isSupplier) {
      base.push(
        { header: 'التصنيف', key: 'categoryName' },
        { header: 'فئة المورد', key: 'providerClassName' },
        { header: 'مستوى الأهمية', key: 'importanceLevelName' },
      );
    } else {
      base.push({ header: 'تصنيف العميل', key: 'categoryName' });
    }

    base.push(
      { header: 'تاريخ الفاتورة', key: 'invoiceDate', type: 'custom', render: (row) => formatDate(row.invoiceDate) },
      { header: 'تاريخ الاستحقاق', key: 'dueDate', type: 'custom', render: (row) => formatDate(row.dueDate) },
      { header: 'صافي الفاتورة', key: 'netAmount', type: 'custom', render: (row) => (<span className="font-medium text-gray-900">{formatCurrency(row.netAmount)}</span>) },
      { header: 'المتبقي', key: 'remainingAmount', type: 'custom', render: (row) => (<span className="font-semibold text-amber-700">{formatCurrency(row.remainingAmount)}</span>) },
      { header: 'العمر (أيام)', key: 'ageDays' },
      { header: 'متأخرة', key: 'isOverdue', type: 'custom', render: (row) => (<span className={`rounded-full px-2 py-1 text-xs ${row.isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{row.isOverdue ? 'نعم' : 'لا'}</span>) },
      { header: 'الحالة', key: 'status', type: 'custom', render: (row) => (<span className={`rounded-full px-2 py-1 text-xs ${getStatusBadge(row.isOverdue)}`}>{row.status || '-'}</span>) },
    );

    return base;
  }, [isSupplier]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير أعمار الذمم</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض الفواتير المفتوحة والمتبقية حسب عمر الدين وتاريخ الفاتورة وحالة التأخير
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleExport(queryParams)}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
        </button>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">نوع الطرف</label>
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              {PARTY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleChange('partyType', tab.value)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    filters.partyType === tab.value
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <SearchableSelect
            label={isSupplier ? 'المورد' : 'العميل'}
            value={filters.partyId || ''}
            onChange={(event) => handleChange('partyId', event.target.value)}
            placeholder={isSupplier ? 'اختر المورد...' : 'اختر العميل...'}
            options={partyOptions}
          />

          <DateInput
            label="حتى تاريخ"
            value={filters.referenceDate || ''}
            onChange={(event) => handleChange('referenceDate', event.target.value)}
          />

          <SearchableSelect
            label="ترتيب حسب"
            value={filters.sortBy || ''}
            onChange={(event) => handleChange('sortBy', event.target.value)}
            placeholder="بدون ترتيب"
            options={SORT_BY_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isSupplier ? (
            <>
              <SearchableSelect
                label="فئة المورد"
                value={filters.providerClass || ''}
                onChange={(event) => handleChange('providerClass', event.target.value)}
                placeholder="كل الفئات"
                options={providerClassOptions}
              />
              <SearchableSelect
                label="مستوى الأهمية"
                value={filters.importanceLevel || ''}
                onChange={(event) => handleChange('importanceLevel', event.target.value)}
                placeholder="كل المستويات"
                options={importanceLevelOptions}
              />
              <SearchableSelect
                label="حالة المورد"
                value={filters.partyStatus || ''}
                onChange={(event) => handleChange('partyStatus', event.target.value)}
                placeholder="كل الحالات"
                options={supplierStatusOptions}
              />
            </>
          ) : (
            <>
              <SearchableSelect
                label="تصنيف العميل"
                value={filters.category || ''}
                onChange={(event) => handleChange('category', event.target.value)}
                placeholder="كل التصنيفات"
                options={customerCategoryOptions}
              />
              <SearchableSelect
                label="حالة العميل"
                value={filters.partyStatus || ''}
                onChange={(event) => handleChange('partyStatus', event.target.value)}
                placeholder="كل الحالات"
                options={customerStatusOptions}
              />
            </>
          )}

          <SearchableSelect
            label="اتجاه الترتيب"
            value={filters.sortOrder || ''}
            onChange={(event) => handleChange('sortOrder', event.target.value)}
            placeholder="بدون ترتيب"
            options={SORT_ORDER_OPTIONS}
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <RotateCcw size={16} />
            مسح الفلاتر
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي الفواتير</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(Number(reportData.totalAmount) || 0)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي المدفوع</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {formatCurrency(Number(reportData.paidAmount) || 0)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي المتأخر</div>
          <div className="mt-2 text-2xl font-bold text-amber-700">
            {formatCurrency(Number(reportData.overdueAmount) || 0)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي المتبقي</div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {formatCurrency(Number(reportData.totalRemainingAmount) || 0)}
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageLoader label="جاري تحميل تقرير أعمار الذمم..." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table
              columns={columns}
              data={details}
              loading={isFetching}
              emptyMessage="لا توجد بيانات لعرضها"
            />
          </div>

          <Pagination
            currentPage={Number(filters.pageNumber) || 1}
            totalPages={Math.max(Math.ceil(totalRows / Math.max(Number(filters.pageSize) || 50, 1)), 1)}
            pageSize={Number(filters.pageSize) || 50}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default AgingReportPage;