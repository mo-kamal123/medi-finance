import { Link } from 'react-router-dom';
import Table from '../../../shared/ui/table';
import { Eye, Trash2 } from 'lucide-react';

const CustomerTable = ({ data, onDelete }) => {
  const columns = [
    { header: 'الكود', key: 'customerCode' },
    { header: 'الاسم العربي', key: 'customerNameAr' },
    { header: 'الاسم الانجليزي', key: 'customerNameEn' },
    { header: 'الموبايل', key: 'phone' },
    { header: 'البريد الالكتروني', key: 'email' },
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
            to={`/customers/${row.customerID}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="عرض"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => onDelete?.(row.customerID)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={data} />;
};

export default CustomerTable;
