import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Paperclip, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import NormalSelect from '../../../shared/ui/NormalSelect';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { useDebounce } from '../../../shared/lib/use-debounce';
import { formatFileSize } from '../../../shared/utils/formatters';
import {
  useSuppliers,
  useSupplierStatuses,
  useProviderClasses,
  useImportanceLevels,
  useGovernorates,
} from '../hooks/suppliers.queries';

const StatusBadge = ({ statusName }) => {
  const normalized = String(statusName || '').trim().toLowerCase();
  let color = 'bg-gray-100 text-gray-700';
  if (normalized.startsWith('deactiv') || normalized.includes('inactiv')) {
    color = 'bg-red-100 text-red-700';
  } else if (normalized.startsWith('activ') || normalized === 'active') {
    color = 'bg-emerald-100 text-emerald-700';
  } else if (normalized === 'hold' || normalized === 'pending') {
    color = 'bg-amber-100 text-amber-700';
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {statusName || 'Unknown'}
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
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
      لا
    </span>
  );

const Columns = [
  { header: 'ID', key: 'supplierID' },
  { header: 'Name (AR)', key: 'supplierNameAr' },
  { header: 'Category', key: 'categoryName' },
  { header: 'Branches', key: 'locationsCount' },
  {
    header: 'Status', key: 'status', type: 'custom',
    render: (row) => <StatusBadge statusName={row.status} />,
  },
  {
    header: 'Work with Medicard', key: 'providerWorkWithMedicard', type: 'custom',
    render: (row) => <BooleanBadge value={row.providerWorkWithMedicard} />,
  },
  {
    header: 'Only Medicard', key: 'isMedicardProvider', type: 'custom',
    render: (row) => <BooleanBadge value={row.isMedicardProvider} />,
  },
  { header: 'Class', key: 'providerClass' },
  { header: 'Tax number', key: 'taxNumber' },
  {
    header: 'Allow chronic', key: 'allowChronicOnPortal', type: 'custom',
    render: (row) => <BooleanBadge value={row.allowChronicOnPortal} />,
  },
  { header: 'Head government', key: 'headQuartersGovernorate' },
  {
    header: 'Attachments', key: 'attachments', type: 'custom',
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [attachmentsSupplier, setAttachmentsSupplier] = useState(null);

  const debouncedSearchTerm = useDebounce(search, 500);

  const activeFilterCount = useMemo(
    () =>
      [status, providerClass, importanceLevel, governorateId].filter(
        (v) => v !== null && v !== ''
      ).length,
    [status, providerClass, importanceLevel, governorateId]
  );

  const handleReset = () => {
    setSearch('');
    setStatus(null);
    setProviderClass(null);
    setImportanceLevel(null);
    setGovernorateId(null);
    setPageNumber(1);
    setShowAdvanced(false);
  };

  const { data: statuses = [] } = useSupplierStatuses();
  const { data: providerClasses = [] } = useProviderClasses();
  const { data: importanceLevels = [] } = useImportanceLevels();
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

  if (isLoading) return <PageLoader label="جاري تحميل الموردين..." />;

  return (
    <div className="space-y-4 p-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">الموردين</h1>
        <p className="text-sm text-gray-600">إدارة جميع الموردين</p>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormInput
            label="بحث"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="ابحث بالكود أو الاسم أو الهاتف"
            autoFocus
          />
          <NormalSelect
            label="الحالة"
            options={statuses.map((s) => ({
              value: s.id,
              label: s.nameAr || s.name,
            }))}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value || null);
              setPageNumber(1);
            }}
            isClearable
          />
          <NormalSelect
            label="فئة المورد"
            options={providerClasses.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
            value={providerClass}
            onChange={(event) => {
              setProviderClass(event.target.value || null);
              setPageNumber(1);
            }}
            isClearable
          />
          <NormalSelect
            label="مستوى الأهمية"
            options={importanceLevels.map((l) => ({
              value: l.id,
              label: l.name,
            }))}
            value={importanceLevel}
            onChange={(event) => {
              setImportanceLevel(event.target.value || null);
              setPageNumber(1);
            }}
            isClearable
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <SlidersHorizontal size={16} />
            <span>فلاتر إضافية</span>
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {activeFilterCount}
              </span>
            ) : null}
            <ChevronDown
              size={16}
              className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            />
          </button>

          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <RotateCcw size={16} />
              مسح الفلاتر
            </button>
          ) : null}
        </div>

        {showAdvanced ? (
          <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 lg:grid-cols-4">
            <NormalSelect
              label="المحافظة"
              options={governorates.map((g) => ({
                value: g.id,
                label: g.nameAr,
              }))}
              value={governorateId}
              onChange={(event) => {
                setGovernorateId(event.target.value || null);
                setPageNumber(1);
              }}
              isClearable
            />
          </div>
        ) : null}
      </div>

      <Table
        columns={Columns}
        data={suppliers}
        loading={isLoading}
        extraRenderArg={setAttachmentsSupplier}
        onRowClick={(row) => navigate(`/suppliers/${row.supplierID || row.id}`)}
      />

      <AttachmentsModal
        supplier={attachmentsSupplier}
        onClose={() => setAttachmentsSupplier(null)}
      />

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
    </div>
  );
};

export default SuppliersPage;
