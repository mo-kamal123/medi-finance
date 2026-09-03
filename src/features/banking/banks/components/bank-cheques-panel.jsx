import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../../shared/ui/table';
import Pagination from '../../../../shared/ui/pagination';
import { paginateItems } from '../../../../shared/utils/list-utils';
import { formatDate } from '../../../../shared/utils/formatters';
import { useCheques } from '../../cheques/hooks/cheques.queries';

const BankChequesPanel = () => {
  const navigate = useNavigate();
  const { data = [], isLoading } = useCheques();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const bankCheques = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const pagination = useMemo(
    () => paginateItems(bankCheques, pageNumber, pageSize),
    [bankCheques, pageNumber, pageSize]
  );

  const columns = [
    { header: 'رقم الشيك', key: 'chequeNumber' },
    {
      header: 'تاريخ الشيك',
      key: 'chequeDate',
      type: 'custom',
      render: (row) => formatDate(row.chequeDate),
    },
    { header: 'القيمة', key: 'amount' },
    {
      header: 'العميل/المورد',
      key: 'partyNameAr',
      type: 'custom',
      render: (row) =>
        row.partyNameAr || row.customerNameAr || row.supplierNameAr || '-',
    },
    {
      header: 'نوع المعاملة',
      key: 'transactionTypeNameAr',
      type: 'custom',
      render: (row) =>
        row.transactionTypeNameAr ||
        (row.transactionType === 'PAYMENT' ? 'صرف' : 'قبض'),
    },
    {
      header: 'تاريخ الاستلام',
      key: 'receiptDate',
      type: 'custom',
      render: (row) => formatDate(row.receiptDate),
    },
    {
      header: 'تاريخ الاستحقاق',
      key: 'dueDate',
      type: 'custom',
      render: (row) => formatDate(row.dueDate),
    },
    { header: 'الحالة', key: 'statusNameAr' },
    {
      header: 'الإجراءات',
      key: 'actions',
      type: 'custom',
      render: (row) => (
        <button
          onClick={() => navigate(`/cheques/${row.chequeID}`)}
          className="text-blue-600 hover:text-blue-800"
          title="فتح"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={pagination.items}
        loading={isLoading}
        onRowClick={(row) => navigate(`/cheques/${row.chequeID}`)}
      />
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

export default BankChequesPanel;