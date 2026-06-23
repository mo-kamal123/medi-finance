import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Plus, Trash2 } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { useDebounce } from '../../../shared/lib/use-debounce';
import { useSuppliers } from '../hooks/suppliers.queries';

const ACTIVE_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'true', label: 'نشط' },
  { value: 'false', label: 'غير نشط' },
];

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const { data: response, isLoading } = useSuppliers({
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
    pageNumber,
    pageSize,
  });

  const { items: suppliers = [], totalPages = 1 } = response || {};

  const columns = [
    { header: 'الكود', key: 'supplierCode' },
    { header: 'الاسم العربي', key: 'supplierNameAr' },
    { header: 'الاسم الانجليزي', key: 'supplierNameEn' },
    { header: 'الشخص المسؤول', key: 'contactPerson' },
    { header: 'الموبايل', key: 'phone' },
    { header: 'البريد الالكتروني', key: 'email' },
    {
      header: 'نوع المورد', key: 'supplierType', type: 'custom',
      render: (row) => (row.supplierType === 1 ? 'مورد' : 'مورد نقدي'),
    },
    {
      header: 'مدة السداد', key: 'paymentTermDays', type: 'custom',
      render: (row) => `${row.paymentTermDays} يوم`,
    },
    {
      header: 'الحالة', key: 'isActive', type: 'custom',
      render: (row) => (row.isActive ? 'نشط' : 'غير نشط'),
    },
    {
      header: 'الإجراءات', key: 'actions', type: 'custom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link to={`/suppliers/${row.supplierID}`} className="text-blue-600 transition-colors hover:text-blue-800" title="عرض">
            <Eye size={18} />
          </Link>
          <button onClick={() => console.log('Delete', row.supplierID)} className="text-red-600 transition-colors hover:text-red-800" title="حذف">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) return <PageLoader label="جاري تحميل الموردين..." />;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">الموردين</h1>
          <p className="text-sm text-gray-600">إدارة جميع الموردين بسهولة</p>
        </div>
        <button onClick={() => navigate('/suppliers/new')} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          <Plus size={16} /> مورد جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2">
        <FormInput label="بحث" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالكود أو الاسم أو الهاتف" autoFocus />
        <SearchableSelect
          label="الحالة"
          value={isActive}
          onChange={(event) => {
            setIsActive(event.target.value);
            setPageNumber(1);
          }}
          placeholder="الكل"
          options={ACTIVE_OPTIONS}
        />
      </div>

      <Table columns={columns} data={suppliers} loading={isLoading} />

      <Pagination
        currentPage={pageNumber}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPageNumber}
        onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
      />
    </div>
  );
};

export default SuppliersPage;
