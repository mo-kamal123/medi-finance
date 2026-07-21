import { useNavigate } from 'react-router-dom';
import Table from '../../../shared/ui/table';

const StatusBadge = ({ statusName }) => {
  const colors = {
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-red-100 text-red-700',
    Suspended: 'bg-amber-100 text-amber-700',
  };
  const color = colors[statusName] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {statusName || 'Unknown'}
    </span>
  );
};

const columns = [
  { header: 'الكود', key: 'customerCode' },
  { header: 'الاسم العربي', key: 'customerNameAr' },
  { header: 'الاسم الانجليزي', key: 'customerNameEn' },
  { header: 'التصنيف', key: 'categoryName' },
  { header: 'كود الحساب', key: 'accountCode' },
  { header: 'اسم الحساب', key: 'accountNameAr' },
  {
    header: 'الحالة', key: 'statusName', type: 'custom',
    render: (row) => <StatusBadge statusName={row.statusName} />,
  },
];

const CustomerTable = ({ data }) => {
  const navigate = useNavigate();
  return (
    <Table
      columns={columns}
      data={data}
      onRowClick={(row) => navigate(`/customers/${row.customerID}`)}
    />
  );
};

export default CustomerTable;
