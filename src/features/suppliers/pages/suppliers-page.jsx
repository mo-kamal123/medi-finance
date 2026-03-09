import { useSuppliers } from '../hooks/suppliers.queries';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Plus, Trash2 } from 'lucide-react';
import Table from '../../../shared/ui/table';

const SuppliersPage = () => {
  const { data = [], isLoading } = useSuppliers();
  //   const { mutate: deleteSupplier } = useDeleteSupplier();
  const navigate = useNavigate();

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
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="عرض"
          >
            <Eye size={18} />
          </Link>

          <button
            onClick={() => console.log('Delete', row.supplierID)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold">الموردين</h1>
          <p className="text-sm text-gray-600">إدارة جميع الموردين بسهولة</p>
        </div>

        <button
          onClick={() => navigate('/suppliers/new')}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={16} />
          مورد جديد
        </button>
      </div>

      <Table columns={columns} data={data} />
    </div>
  );
};

export default SuppliersPage;
