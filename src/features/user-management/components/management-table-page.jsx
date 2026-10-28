import { useState } from 'react';
import { Search } from 'lucide-react';
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
}) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [roleId, setRoleId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = search.trim().toLocaleLowerCase('ar');
  const filtered = data.filter(
    (row) =>
      (!status || row.status === status) &&
      (!roleId || row.roleId === roleId) &&
      searchKeys.some((key) =>
        String(row[key] ?? '')
          .toLocaleLowerCase('ar')
          .includes(query)
      )
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const updateFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'إدارة المستخدمين' }, { label: title }]} />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        <p className="mt-3 inline-block rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          بيانات تجريبية للعرض فقط
        </p>
      </div>

      <div className="grid grid-cols-1 items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <FormInput
          label="بحث"
          aria-label="بحث"
          value={search}
          icon={Search}
          onChange={(event) => updateFilter(setSearch, event.target.value)}
          placeholder={searchPlaceholder}
          containerClass="xl:col-span-2"
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
          onChange={(event) => updateFilter(setStatus, event.target.value)}
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
            }}
            className="justify-self-start text-sm text-primary hover:underline"
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      <p role="status" className="text-sm text-gray-600">
        عدد النتائج: {filtered.length} من {data.length}
      </p>
      <Table
        columns={columns}
        data={filtered.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        )}
        emptyMessage="لا توجد نتائج مطابقة للبحث"
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(value) => updateFilter(setPageSize, value)}
      />
    </div>
  );
};

export default ManagementTablePage;
