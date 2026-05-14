import { useMemo, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { matchesSearch, paginateItems } from '../../../shared/utils/list-utils';
import { formatDate, formatNumber } from '../../../shared/utils/formatters';
import { useCashVouchers } from '../hooks/commercial-papers.queries';

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getPartyName = (row) =>
  row.name ||
  row.receivedFrom ||
  row.paidTo ||
  row.partyName ||
  '-';

const getVoucherNumber = (row) =>
  row.voucherNumber || row.referenceNumber || row.voucherID || row.id || '-';

const CashVouchersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: response = [], isLoading } = useCashVouchers({
    pageNumber,
    pageSize,
  });

  const vouchers = useMemo(() => normalizeCollection(response), [response]);

  const filteredVouchers = useMemo(
    () =>
      vouchers.filter((voucher) =>
        matchesSearch(
          {
            ...voucher,
            partyName: getPartyName(voucher),
            voucherNumber: getVoucherNumber(voucher),
          },
          [
            'voucherNumber',
            'referenceNumber',
            'invoiceNumber',
            'name',
            'partyName',
            'bankName',
            'checkNumber',
          ],
          search
        )
      ),
    [search, vouchers]
  );

  const pagination = useMemo(
    () => paginateItems(filteredVouchers, pageNumber, pageSize),
    [filteredVouchers, pageNumber, pageSize]
  );

  const columns = useMemo(
    () => [
      {
        header: 'رقم السند',
        key: 'voucherNumber',
        type: 'custom',
        render: (row) => getVoucherNumber(row),
      },
      {
        header: 'نوع السند',
        key: 'isReceipt',
        type: 'custom',
        render: (row) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              row.isReceipt ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}
          >
            {row.isReceipt ? 'سند قبض' : 'سند صرف'}
          </span>
        ),
      },
      {
        header: 'الطرف',
        key: 'name',
        type: 'custom',
        render: (row) => getPartyName(row),
      },
      {
        header: 'رقم الفاتورة',
        key: 'invoiceNumber',
      },
      {
        header: 'البنك',
        key: 'bankName',
      },
      {
        header: 'المبلغ',
        key: 'amount',
        type: 'custom',
        render: (row) => formatNumber(row.amount || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        header: 'التاريخ',
        key: 'date',
        type: 'custom',
        render: (row) =>
          formatDate(row.date || row.voucherDate),
      },
      {
        header: 'الإجراءات',
        key: 'actions',
        type: 'custom',
        render: (row) => (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(`/commercial-papers/cash-vouchers/${row.voucherID || row.id}`)
              }
              className="text-blue-600"
            >
              <Eye size={18} />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">سندات القبض والدفع</h1>

        <button
          onClick={() => navigate('/commercial-papers/cash-vouchers/new')}
          className="bg-primary text-white px-4 py-2 flex justify-between items-center gap-3 rounded"
        >
          <Plus size={16} /> إضافة سند
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <FormInput
          label="بحث"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPageNumber(1);
          }}
          placeholder="ابحث برقم السند أو الفاتورة أو الطرف"
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

export default CashVouchersPage;
