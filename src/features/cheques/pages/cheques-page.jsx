import { useMemo, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { matchesSearch, paginateItems } from '../../../shared/utils/list-utils';
import { useCheques } from '../hooks/cheques.queries';

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'PENDING_DEPOSIT', label: 'PENDING_DEPOSIT' },
  { value: 'DEPOSITED', label: 'DEPOSITED' },
  { value: 'BOUNCED', label: 'BOUNCED' },
];

const ChequesPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data = [], isLoading } = useCheques(status ? { status } : {});

  const filteredCheques = useMemo(
    () =>
      data.filter((cheque) =>
        matchesSearch(
          cheque,
          ['chequeNumber', 'customerName', 'bankName', 'status', 'statusAlert'],
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
      render: (row) =>
        row.chequeDate
          ? new Date(row.chequeDate).toLocaleDateString('ar-EG')
          : '-',
    },
    { header: 'القيمة', key: 'amount' },
    { header: 'العميل', key: 'customerName' },
    { header: 'البنك', key: 'bankName' },
    {
      header: 'تاريخ الاستلام',
      key: 'receiptDate',
      type: 'custom',
      render: (row) =>
        row.receiptDate
          ? new Date(row.receiptDate).toLocaleDateString('ar-EG')
          : '-',
    },
    { header: 'الحالة', key: 'status' },
    { header: 'أيام الانتظار', key: 'daysPending' },
    { header: 'تنبيه', key: 'statusAlert' },
    {
      header: 'الإجراءات',
      key: 'actions',
      type: 'custom',
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/cheques/${row.chequeID}`)}
            className="text-blue-600"
          >
            <Eye size={18} />
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

      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="بحث"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPageNumber(1);
          }}
          placeholder="ابحث برقم الشيك أو العميل أو البنك"
        />

        <div>
          <FormLabel label="الحالة" />
          <SearchableSelect
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPageNumber(1);
            }}
            options={statusOptions}
            placeholder="كل الحالات"
          />
        </div>
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

const FormLabel = ({ label }) => (
  <label className="block mb-1 font-medium text-gray-700">{label}</label>
);

export default ChequesPage;
