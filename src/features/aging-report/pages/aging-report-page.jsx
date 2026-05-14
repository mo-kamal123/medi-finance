import { useMemo, useState } from 'react';
import FormInput from '../../../shared/ui/input';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import PageLoader from '../../../shared/ui/page-loader';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { useCustomers, useFinancialPeriods, useSuppliers } from '../../invoices/hooks/invoices.queries';
import { useAgingReport } from '../hooks/aging-report.queries';

const PARTY_TYPE_OPTIONS = [
  { value: '', label: 'كل الأطراف' },
  { value: 'Customer', label: 'العملاء' },
  { value: 'Supplier', label: 'الموردين' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'Draft', label: 'مسودة' },
  { value: 'Posted', label: 'مرحلة' },
  { value: 'Paid', label: 'مدفوعة' },
  { value: 'PartiallyPaid', label: 'مدفوعة جزئيًا' },
  { value: 'Overdue', label: 'متأخرة' },
];

const getStatusClasses = (status, isOverdue) => {
  if (isOverdue) return 'bg-red-100 text-red-700';
  if (status === 'Posted') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Paid') return 'bg-sky-100 text-sky-700';
  return 'bg-gray-100 text-gray-700';
};

const AgingReportPage = () => {
  const [filters, setFilters] = useState({
    partyType: '',
    partyId: '',
    asOfDate: '',
    financialPeriodId: '',
    fromInvoiceDate: '',
    toInvoiceDate: '',
    status: '',
    includePaid: false,
    overdueOnly: false,
    pageNumber: 1,
    pageSize: 10,
  });

  const { data: customers = [] } = useCustomers();
  const { data: suppliers = [] } = useSuppliers();
  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: response, isLoading, isFetching } = useAgingReport(filters);

  const reportData = response?.data ?? {};
  const details = useMemo(() => reportData.details ?? [], [reportData.details]);
  const totalRows = Number(reportData.totalRows) || 0;
  const totalPages = Math.max(
    Math.ceil(totalRows / Math.max(Number(filters.pageSize) || 10, 1)),
    1
  );

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

  const totalNetAmount = useMemo(
    () => details.reduce((sum, item) => sum + (Number(item.netAmount) || 0), 0),
    [details]
  );

  const totalRemainingAmount = useMemo(
    () =>
      details.reduce((sum, item) => sum + (Number(item.remainingAmount) || 0), 0),
    [details]
  );

  const overdueCount = useMemo(
    () => details.filter((item) => Number(item.isOverdue) === 1).length,
    [details]
  );

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        [field]: value,
        pageNumber: field === 'pageNumber' ? value : 1,
      };

      if (field === 'partyType') {
        next.partyId = '';
      }

      return next;
    });
  };

  const columns = useMemo(
    () => [
      {
        header: 'نوع الحركة',
        key: 'transactionType',
      },
      {
        header: 'رقم الفاتورة',
        key: 'invoiceNumber',
      },
      {
        header: 'اسم الطرف',
        key: 'partyNameAr',
      },
      {
        header: 'الملاحظات',
        key: 'notes',
      },
      {
        header: 'تاريخ الفاتورة',
        key: 'invoiceDate',
        type: 'custom',
        render: (row) => formatDate(row.invoiceDate),
      },
      {
        header: 'صافي الفاتورة',
        key: 'netAmount',
        type: 'custom',
        render: (row) => (
          <span className="font-medium text-gray-900">
            {formatCurrency(row.netAmount)}
          </span>
        ),
      },
      {
        header: 'المتبقي',
        key: 'remainingAmount',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold text-amber-700">
            {formatCurrency(row.remainingAmount)}
          </span>
        ),
      },
      {
        header: 'العمر بالأيام',
        key: 'ageDays',
      },
      {
        header: 'متأخرة',
        key: 'isOverdue',
        type: 'custom',
        render: (row) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              Number(row.isOverdue) === 1
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {Number(row.isOverdue) === 1 ? 'نعم' : 'لا'}
          </span>
        ),
      },
      {
        header: 'الحالة',
        key: 'status',
        type: 'custom',
        render: (row) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${getStatusClasses(
              row.status,
              Number(row.isOverdue) === 1
            )}`}
          >
            {row.status || '-'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">تقرير أعمار الذمم</h1>
        <p className="mt-1 text-sm text-gray-600">
          عرض الفواتير المفتوحة والمتبقية حسب عمر الدين وتاريخ الفاتورة وحالة التأخير
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <FormInput
          as="select"
          label="نوع الطرف"
          value={filters.partyType}
          onChange={(event) =>
            handleFilterChange('partyType', event.target.value)
          }
        >
          {PARTY_TYPE_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormInput>

        <FormInput
          as="select"
          label="الطرف"
          value={filters.partyId}
          onChange={(event) => handleFilterChange('partyId', event.target.value)}
          disabled={!filters.partyType}
        >
          <option value="">كل الأطراف</option>
          {partyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormInput>

        <FormInput
          type="date"
          label="حتى تاريخ"
          value={filters.asOfDate}
          onChange={(event) =>
            handleFilterChange('asOfDate', event.target.value)
          }
        />

        <FormInput
          as="select"
          label="الفترة المالية"
          value={filters.financialPeriodId}
          onChange={(event) =>
            handleFilterChange('financialPeriodId', event.target.value)
          }
        >
          <option value="">كل الفترات</option>
          {financialPeriods.map((period) => (
            <option
              key={period.financialPeriodID}
              value={period.financialPeriodID}
            >
              {period.nameAr || period.financialPeriodNameAr || period.nameEn}
            </option>
          ))}
        </FormInput>

        <FormInput
          type="date"
          label="من تاريخ الفاتورة"
          value={filters.fromInvoiceDate}
          onChange={(event) =>
            handleFilterChange('fromInvoiceDate', event.target.value)
          }
        />

        <FormInput
          type="date"
          label="إلى تاريخ الفاتورة"
          value={filters.toInvoiceDate}
          onChange={(event) =>
            handleFilterChange('toInvoiceDate', event.target.value)
          }
        />

        <FormInput
          as="select"
          label="الحالة"
          value={filters.status}
          onChange={(event) => handleFilterChange('status', event.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormInput>

        <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={filters.includePaid}
              onChange={(event) =>
                handleFilterChange('includePaid', event.target.checked)
              }
            />
            تضمين المسدد
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={filters.overdueOnly}
              onChange={(event) =>
                handleFilterChange('overdueOnly', event.target.checked)
              }
            />
            المتأخر فقط
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">عدد السجلات</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{totalRows}</div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي صافي الفواتير</div>
          <div className="mt-2 text-2xl font-bold text-primary">
            {formatCurrency(totalNetAmount)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي المتبقي</div>
          <div className="mt-2 text-2xl font-bold text-amber-700">
            {formatCurrency(totalRemainingAmount)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">عدد المتأخر</div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {overdueCount}
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageLoader label="جاري تحميل تقرير أعمار الذمم..." />
      ) : (
        <>
          <Table
            columns={columns}
            data={details}
            loading={isFetching}
            emptyMessage="لا توجد بيانات لعرضها"
          />

          <Pagination
            currentPage={Number(reportData.pageNumber) || Number(filters.pageNumber) || 1}
            totalPages={totalPages}
            pageSize={Number(reportData.pageSize) || Number(filters.pageSize) || 10}
            onPageChange={(page) => handleFilterChange('pageNumber', page)}
            onPageSizeChange={(value) => handleFilterChange('pageSize', value)}
          />
        </>
      )}
    </div>
  );
};

export default AgingReportPage;
