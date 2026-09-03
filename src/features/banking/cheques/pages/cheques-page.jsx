import { useMemo, useState } from 'react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../../shared/ui/input';
import NormalSelect from '../../../../shared/ui/NormalSelect';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import { matchesSearch, paginateItems } from '../../../../shared/utils/list-utils';
import { formatDate } from '../../../../shared/utils/formatters';
import { useCheques, useChequeStatuses } from '../hooks/cheques.queries';
import { useDeleteCheque } from '../hooks/cheques.mutations';

const transactionTypeOptions = [
  { value: '', label: 'كل المعاملات' },
  { value: 'RECEIPT', label: 'قبض' },
  { value: 'PAYMENT', label: 'صرف' },
];

const ChequesPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data = [], isLoading } = useCheques(
    Object.assign(
      {},
      status ? { status } : {},
      transactionType ? { transactionType } : {}
    )
  );
  const { data: receiptStatuses = [] } = useChequeStatuses(0);
  const { data: paymentStatuses = [] } = useChequeStatuses(1);
  const { mutate: deleteCheque } = useDeleteCheque();

  const statusOptions = useMemo(() => {
    const opts = [{ value: '', label: 'كل الحالات' }];
    const seen = new Set();
    [...receiptStatuses, ...paymentStatuses].forEach((s) => {
      const value = s.Name || s.name || String(s.id ?? s.Id ?? s);
      if (seen.has(value)) return;
      seen.add(value);
      const label = s.NameAr || s.nameAr || s.Name || s.name || s;
      opts.push({ value, label });
    });
    return opts;
  }, [receiptStatuses, paymentStatuses]);

  const filteredCheques = useMemo(
    () =>
      (Array.isArray(data) ? data : []).filter((cheque) =>
        matchesSearch(
          cheque,
          [
            'chequeNumber',
            'customerNameAr',
            'supplierNameAr',
            'partyNameAr',
            'bankNameAr',
            'status',
            'statusNameAr',
          ],
          search
        )
      ),
    [data, search]
  );

  const pagination = useMemo(
    () => paginateItems(filteredCheques, pageNumber, pageSize),
    [filteredCheques, pageNumber, pageSize]
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
      render: (row) => row.partyNameAr || row.customerNameAr || row.supplierNameAr || '-',
    },
    { header: 'البنك', key: 'bankNameAr' },
    {
      header: 'تاريخ الاستلام',
      key: 'receiptDate',
      type: 'custom',
      render: (row) => formatDate(row.receiptDate),
    },
    { header: 'الحالة', key: 'statusNameAr' },
    {
      header: 'الإجراءات',
      key: 'actions',
      type: 'custom',
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/cheques/${row.chequeID}`)}
            className="text-blue-600 hover:text-blue-800"
            title="فتح"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذا الشيك؟')) {
                deleteCheque(row.chequeID);
              }
            }}
            className="text-red-600 hover:text-red-800"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">الشيكات</h1>
          <p className="text-sm text-gray-500">إدارة ومتابعة الشيكات</p>
        </div>

        <button
          onClick={() => navigate('/cheques/new')}
          className="bg-primary text-white px-4 py-2 flex justify-between items-center gap-3 rounded"
        >
          <Plus size={16} /> إضافة شيك
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="بحث"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPageNumber(1);
          }}
          placeholder="ابحث برقم الشيك أو العميل أو البنك"
        />

        <NormalSelect
          label="الحالة"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPageNumber(1);
          }}
          options={statusOptions}
        />

        <NormalSelect
          label="نوع المعاملة"
          value={transactionType}
          onChange={(event) => {
            setTransactionType(event.target.value);
            setPageNumber(1);
          }}
          options={transactionTypeOptions}
        />
      </div>

      <Table columns={columns} data={pagination.items} loading={isLoading} onRowClick={(row) => navigate(`/cheques/${row.chequeID}`)} />

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

export default ChequesPage;
