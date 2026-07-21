import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import NormalSelect from '../../../shared/ui/NormalSelect';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { useDebounce } from '../../../shared/lib/use-debounce';
import {
  useSuppliers,
  useSupplierStatuses,
  useProviderClasses,
  useImportanceLevels,
  useGovernorates,
} from '../hooks/suppliers.queries';

const StatusBadge = ({ statusName }) => {
  const colors = {
    Active: 'bg-emerald-100 text-emerald-700',
    Deactive: 'bg-red-100 text-red-700',
    Hold: 'bg-amber-100 text-amber-700',
  };
  const color = colors[statusName] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {statusName || 'Unknown'}
    </span>
  );
};

const Columns = [
  { header: 'الكود', key: 'supplierCode' },
  { header: 'الاسم العربي', key: 'supplierNameAr' },
  { header: 'الاسم الانجليزي', key: 'supplierNameEn' },
  { header: 'التصنيف', key: 'categoryName' },
  { header: 'الفئة', key: 'providerClassName' },
  { header: 'مستوى الأهمية', key: 'importanceLevelName' },
  { header: 'المقر الرئيسي', key: 'headQuarterGovernorateName' },
  {
    header: 'الحالة', key: 'statusName', type: 'custom',
    render: (row) => <StatusBadge statusName={row.statusName} />,
  },
];

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState(null);
  const [providerClass, setProviderClass] = useState(null);
  const [importanceLevel, setImportanceLevel] = useState(null);
  const [governorateId, setGovernorateId] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearchTerm = useDebounce(search, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDebouncedSearch(debouncedSearchTerm);
    setPageNumber(1);
  }, [debouncedSearchTerm]);

  const activeFilterCount = useMemo(
    () =>
      [status, providerClass, importanceLevel, governorateId].filter(
        (v) => v !== null && v !== ''
      ).length,
    [status, providerClass, importanceLevel, governorateId]
  );

  const handleReset = () => {
    setSearch('');
    setDebouncedSearch('');
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
    search: debouncedSearch || undefined,
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
            onChange={(e) => setSearch(e.target.value)}
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
        onRowClick={(row) => navigate(`/suppliers/${row.supplierID || row.id}`)}
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
