import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Plus, Trash2 } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { matchesSearch, paginateItems } from '../../../shared/utils/list-utils';
import { useSuppliers } from '../hooks/suppliers.queries';

const SuppliersPage = () => {
  const { data = [], isLoading } = useSuppliers();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredSuppliers = useMemo(
    () =>
      data.filter((supplier) =>
        matchesSearch(
          supplier,
          [
            'supplierCode',
            'supplierNameAr',
            'supplierNameEn',
            'contactPerson',
            'phone',
            'email',
          ],
          search
        )
      ),
    [data, search]
  );

  const pagination = useMemo(
    () => paginateItems(filteredSuppliers, pageNumber, pageSize),
    [filteredSuppliers, pageNumber, pageSize]
  );

  const columns = [
    { header: 'الكود', key: 'supplierCode' },
    { header: 'الاسم العربي', key: 'supplierNameAr' },
    { header: 'الاسم الانجليزي', key: 'supplierNameEn' },
    { header: 'الشخص المسؤول', key: 'contactPerson' },
    { header: 'الموبايل', key: 'phone' },
    { header: 'البريد الالكتروني', key: 'email' },
    {
      header: 'نوع المورد',
      key: 'supplierType',
      type: 'custom',
      render: (row) => (row.supplierType === 1 ? 'مورد' : 'مورد نقدي'),
    },
    {
      header: 'مدة السداد',
      key: 'paymentTermDays',
      type: 'custom',
      render: (row) => `${row.paymentTermDays} يوم`,
    },
    {
      header: 'الحالة',
      key: 'isActive',
      type: 'custom',
      render: (row) => (row.isActive ? 'نشط' : 'غير نشط'),
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      type: 'custom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/suppliers/${row.supplierID}`}
            className="text-blue-600 transition-colors hover:text-blue-800"
            title="عرض"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => console.log('Delete', row.supplierID)}
            className="text-red-600 transition-colors hover:text-red-800"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader label="جاري تحميل الموردين..." />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">الموردين</h1>
          <p className="text-sm text-gray-600">إدارة جميع الموردين بسهولة</p>
        </div>

        <button
          onClick={() => navigate('/suppliers/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          مورد جديد
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <FormInput
          label="بحث"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPageNumber(1);
          }}
          placeholder="ابحث بالكود أو الاسم أو الهاتف"
        />
      </div>

      <Table columns={columns} data={pagination.items} loading={isLoading} />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
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
