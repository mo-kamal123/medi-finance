import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Paperclip, Search, X } from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import NormalSelect from '../../../../shared/ui/NormalSelect';
import FilterBar from '../../../../shared/ui/filter-bar';
import PageLoader from '../../../../shared/ui/page-loader';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import { formatFileSize } from '../../../../shared/utils/formatters';
import {
  useSuppliers,
  useGovernorates,
} from '../hooks/suppliers.queries';

const STATUS_OPTIONS = [
  { value: 'activated', label: 'نشط' },
  { value: 'Deactived', label: 'غير نشط' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'hold', label: 'موقوف مؤقتاً' },
];

const CLASS_OPTIONS = ['A', 'B', 'C', 'P'].map((value) => ({ value, label: value }));

const IMPORTANCE_OPTIONS = ['A', 'AA', 'AKK', 'Y', 'X'].map((value) => ({ value, label: value }));

const StatusBadge = ({ statusName }) => {
  const normalized = String(statusName || '').trim().toLowerCase();
  let color = 'bg-gray-100 text-gray-700';
  let label = statusName || 'غير معروف';
  if (normalized.startsWith('deactiv') || normalized.includes('inactiv')) {
    color = 'bg-red-100 text-red-700';
    label = 'غير نشط';
  } else if (normalized.startsWith('activ') || normalized === 'active') {
    color = 'bg-emerald-100 text-emerald-700';
    label = 'نشط';
  } else if (normalized === 'hold' || normalized === 'pending') {
    color = 'bg-amber-100 text-amber-700';
    label = normalized === 'hold' ? 'موقوف مؤقتاً' : 'قيد الانتظار';
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const BooleanBadge = ({ value }) =>
  value ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
      <Check size={14} />
      نعم
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-500">
      لا
    </span>
  );

const Columns = [
  { header: 'كود المورد', key: 'supplierID' },
  { header: 'اسم المورد', key: 'supplierNameAr' },
  { header: 'التصنيف', key: 'categoryName' },
  { header: 'عدد الفروع', key: 'locationsCount' },
  {
    header: 'الحالة', key: 'status', type: 'custom',
    render: (row) => <StatusBadge statusName={row.status} />,
  },
  {
    header: 'يتعامل مع ميديكارد', key: 'providerWorkWithMedicard', type: 'custom',
    render: (row) => <BooleanBadge value={row.providerWorkWithMedicard} />,
  },
  {
    header: 'ميديكارد فقط', key: 'isMedicardProvider', type: 'custom',
    render: (row) => <BooleanBadge value={row.isMedicardProvider} />,
  },
  { header: 'فئة المورد', key: 'providerClass' },
  { header: 'الرقم الضريبي', key: 'taxNumber' },
  {
    header: 'السماح بالأمراض المزمنة', key: 'allowChronicOnPortal', type: 'custom',
    render: (row) => <BooleanBadge value={row.allowChronicOnPortal} />,
  },
  { header: 'محافظة المقر الرئيسي', key: 'headQuartersGovernorate' },
  {
    header: 'المرفقات', key: 'attachments', type: 'custom',
    render: (row, _, openAttachments) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openAttachments(row);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <Paperclip size={14} />
        {(row.attachments || []).length}
      </button>
    ),
  },
];

const AttachmentsModal = ({ supplier, onClose }) => {
  if (!supplier) return null;
  const attachments = supplier.attachments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl text-right">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">مرفقات المورد</h3>
            <p className="text-sm text-gray-500">{supplier.supplierNameAr || supplier.supplierNameEn}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {attachments.length === 0 ? (
            <div className="py-10 text-center text-gray-400">لا توجد مرفقات</div>
          ) : (
            <div className="space-y-3">
              {attachments.map((file) => (
                <a
                  key={file.attachmentID}
                  href={file.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Paperclip size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.fileSize)} ·{' '}
                        {file.uploadDate
                          ? new Date(file.uploadDate).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-primary">عرض</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null);
  const [providerClass, setProviderClass] = useState(null);
  const [importanceLevel, setImportanceLevel] = useState(null);
  const [governorateId, setGovernorateId] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [attachmentsSupplier, setAttachmentsSupplier] = useState(null);

  const debouncedSearchTerm = useDebounce(search, 500);

  const activeFilterCount = useMemo(
    () =>
      [search.trim(), status, providerClass, importanceLevel, governorateId].filter(
        (v) => v !== null && v !== ''
      ).length,
    [search, status, providerClass, importanceLevel, governorateId]
  );

  const handleReset = () => {
    setSearch('');
    setStatus(null);
    setProviderClass(null);
    setImportanceLevel(null);
    setGovernorateId(null);
    setPageNumber(1);
  };

  const { data: governorates = [] } = useGovernorates();

  const { data: response, isLoading } = useSuppliers({
    search: debouncedSearchTerm || undefined,
    status: status ?? undefined,
    providerClass: providerClass ?? undefined,
    importanceLevel: importanceLevel ?? undefined,
    governorateId: governorateId ?? undefined,
    pageNumber,
    pageSize,
  });

  const { items: suppliers = [], totalPages = 1 } = response || {};

  if (isLoading && !response) {
    return <PageLoader label="جاري تحميل الموردين..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: 'الموردين' }]} />

      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold md:text-2xl">الموردين</h1>
          <p className="text-sm text-gray-600">إدارة جميع الموردين</p>
        </div>
      </div>

      <FilterBar
        primaryFilters={[
          <FormInput
            key="search"
            label="اسم المورد"
            icon={Search}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPageNumber(1);
            }}
            placeholder="ابحث باسم المورد"
            autoFocus
          />,
          <NormalSelect
            key="status"
            label="الحالة"
            options={STATUS_OPTIONS}
            value={status || ''}
            onChange={(event) => {
              setStatus(event.target.value || null);
              setPageNumber(1);
            }}
            isClearable
            placeholder="كل الحالات"
          />,
          <NormalSelect
            key="class"
            label="فئة المورد"
            options={CLASS_OPTIONS}
            value={providerClass || ''}
            onChange={(event) => {
              setProviderClass(event.target.value || null);
              setPageNumber(1);
            }}
            isClearable
            placeholder="كل الفئات"
          />,
          <NormalSelect
            key="importance"
            label="مستوى الأهمية"
            options={IMPORTANCE_OPTIONS}
            value={importanceLevel || ''}
            onChange={(event) => {
              setImportanceLevel(event.target.value || null);
              setPageNumber(1);
            }}
            isClearable
            placeholder="كل المستويات"
          />,
        ]}
        extraFilters={[
          <NormalSelect
            key="governorate"
            label="المحافظة"
            options={governorates.map((governorate) => ({
              value: governorate.id,
              label: governorate.nameAr,
            }))}
            value={governorateId ?? ''}
            onChange={(event) => {
              setGovernorateId(event.target.value || null);
              setPageNumber(1);
            }}
            isClearable
            placeholder="كل المحافظات"
          />,
        ]}
        onReset={handleReset}
        activeCount={activeFilterCount}
        extraCount={governorateId !== null && governorateId !== '' ? 1 : 0}
      />

      <div className="min-w-0 max-w-full overflow-hidden rounded-xl bg-white [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
        <Table
          columns={Columns}
          data={suppliers}
          loading={isLoading}
          extraRenderArg={setAttachmentsSupplier}
          onRowClick={(row) => navigate(`/suppliers/${row.supplierID || row.id}`)}
        />
      </div>

      <Pagination
        currentPage={pageNumber}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPageNumber}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPageNumber(1);
        }}
      />

      <AttachmentsModal
        supplier={attachmentsSupplier}
        onClose={() => setAttachmentsSupplier(null)}
      />
    </div>
  );
};

export default SuppliersPage;
