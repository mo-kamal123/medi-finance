import { useNavigate } from 'react-router-dom';
import Table from '../../../../shared/ui/table';

const StatusBadge = ({ statusName }) => {
  const normalized = String(statusName || '').trim().toLowerCase();
  let color = 'bg-gray-100 text-gray-700';
  if (normalized.startsWith('deactiv') || normalized.includes('inactiv')) {
    color = 'bg-red-100 text-red-700';
  } else if (normalized.startsWith('activ') || normalized === 'active') {
    color = 'bg-emerald-100 text-emerald-700';
  } else if (normalized === 'hold') {
    color = 'bg-amber-100 text-amber-700';
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {statusName || 'Unknown'}
    </span>
  );
};

const columns = [
  { header: 'الكود', key: 'customerID' },
  { header: 'اسم العميل', key: 'clientName' },
  { header: 'نوع العميل', key: 'clientType' },
  { header: 'التصنيف', key: 'clientCategory' },
  { header: 'أيام التعويض', key: 'reimbursementDueDays' },
  {
    header: 'الحالة', key: 'status', type: 'custom',
    render: (row) => <StatusBadge statusName={row.status} />,
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
