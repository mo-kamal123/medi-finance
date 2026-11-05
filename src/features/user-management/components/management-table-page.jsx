import { useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import Table from '../../../shared/ui/table';
import Pagination from '../../../shared/ui/pagination';

const ManagementTablePage = ({
  title,
  description,
  data,
  columns,
  searchKeys,
  searchPlaceholder,
  roleOptions,
  headerAction,
  onRowClick,
  serverPagination,
  serverFilters,
  showResultCount = true,
  loading = false,
  error,
  errorMessage = 'تعذر تحميل المستخدمين.',
  onRetry,
  isDemo = true,
}) => {
  const [localSearch, setSearch] = useState('');
  const [localStatus, setStatus] = useState('');
  const search = serverFilters?.search ?? localSearch;
  const status = serverFilters?.status ?? localStatus;
  const [roleId, setRoleId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = search.trim().toLocaleLowerCase('ar');
  const filtered = serverFilters
    ? data
    : data.filter(
        (row) =>
          (!status || row.status === status) &&
          (!roleId || row.roleId === roleId) &&
          searchKeys.some((key) =>
            String(row[key] ?? '')
              .toLocaleLowerCase('ar')
              .includes(query)
          )
      );
  const totalPages = serverPagination
    ? Math.max(1, serverPagination.totalPages)
    : Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage =
    serverPagination?.pageNumber ?? Math.min(page, totalPages);

  const updateFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: 'إدارة المستخدمين' }, { label: title }]} />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          {headerAction}
        </div>
        {isDemo && (
          <p className="mt-3 inline-block rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            بيانات تجريبية للعرض فقط
          </p>
        )}
      </div>

      <div className="relative grid grid-cols-1 items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <FormInput
          label={
            serverPagination && !serverFilters ? 'بحث في الصفحة الحالية' : 'بحث'
          }
          aria-label={
            serverPagination && !serverFilters ? 'بحث في الصفحة الحالية' : 'بحث'
          }
          value={search}
          icon={Search}
          onChange={(event) =>
            serverFilters
              ? serverFilters.onChange({ search: event.target.value, status })
              : updateFilter(setSearch, event.target.value)
          }
          placeholder={searchPlaceholder}
          containerClass={serverFilters ? 'xl:col-span-3' : 'xl:col-span-2'}
        />
        {roleOptions && (
          <SearchableSelect
            label="الدور"
            value={roleId}
            onChange={(event) => updateFilter(setRoleId, event.target.value)}
            options={[{ value: '', label: 'جميع الأدوار' }, ...roleOptions]}
          />
        )}
        <SearchableSelect
          label="الحالة"
          value={status}
          onChange={(event) =>
            serverFilters
              ? serverFilters.onChange({ search, status: event.target.value })
              : updateFilter(setStatus, event.target.value)
          }
          options={[
            { value: '', label: 'جميع الحالات' },
            { value: 'active', label: 'نشط' },
            { value: 'inactive', label: 'غير نشط' },
          ]}
        />
        {(search || status || roleId) && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatus('');
              setRoleId('');
              setPage(1);
              serverFilters?.onChange({ search: '', status: '' });
            }}
            aria-label="مسح الفلاتر"
            title="مسح الفلاتر"
            className="absolute top-0 left-0 inline-flex h-11 items-center justify-center px-4 text-gray-600 hover:text-red-600"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {showResultCount && <p role="status" className="text-sm text-gray-600">
        {serverPagination
          ? serverFilters
            ? `إجمالي النتائج: ${serverPagination.totalCount}`
            : `نتائج الصفحة الحالية: ${filtered.length} — إجمالي المستخدمين: ${serverPagination.totalCount}. البحث وفلاتر الحالة تطبق على الصفحة الحالية.`
          : `عدد النتائج: ${filtered.length} من ${data.length}`}
      </p>}
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {errorMessage}
          <button type="button" onClick={onRetry} className="mx-3 underline">
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          <Table
            loading={loading}
            onRowClick={onRowClick}
            columns={columns}
            data={
              serverPagination
                ? filtered
                : filtered.slice(
                    (currentPage - 1) * pageSize,
                    currentPage * pageSize
                  )
            }
            emptyMessage="لا توجد نتائج مطابقة للبحث"
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={serverPagination?.pageSize ?? pageSize}
            onPageChange={serverPagination?.onPageChange ?? setPage}
            onPageSizeChange={
              serverPagination?.onPageSizeChange ??
              ((value) => updateFilter(setPageSize, value))
            }
          />
        </>
      )}
    </div>
  );
};

export default ManagementTablePage;
