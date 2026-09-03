import { useMemo, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import CashVoucherFilters from '../components/cash-voucher-filter';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import { formatDate, formatNumber } from '../../../../shared/utils/formatters';
import { useCashVouchers } from '../hooks/cash-vouchers.queries';
import { buildCashVoucherQueryParams } from '../utils/cash-voucher-filters.utils';

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
  const [filters, setFilters] = useState({
    searchTerm: '',
    isReceipt: '',
    isCleared: '',
    isVoid: '',
    fromDate: '',
    toDate: '',
    pageNumber: 1,
    pageSize: 10,
  });

  const { data: response, isLoading } = useCashVouchers(
    buildCashVoucherQueryParams(filters)
  );

  const { items: vouchers = [], totalPages = 1, pageNumber: currentPage = 1 } =
    response || {};

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
                navigate(`/cash-vouchers/${row.voucherID || row.id}`)
              }
              className="text-blue-600"
              title="عرض"
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
      <Breadcrumb items={[{ label: 'سندات القبض والدفع' }]} />

      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            سندات القبض والدفع
          </h1>
          <p className="text-sm text-gray-600">إدارة جميع السندات بسهولة.</p>
        </div>

        <button
          onClick={() => navigate('/cash-vouchers/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          إضافة سند جديد
        </button>
      </div>
      <CashVoucherFilters filters={filters} setFilters={setFilters} />

      <Table
        columns={columns}
        data={vouchers}
        loading={isLoading}
        onRowClick={(row) =>
          navigate(`/cash-vouchers/${row.voucherID || row.id}`)
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={filters.pageSize}
        onPageChange={(page) =>
          setFilters((prev) => ({ ...prev, pageNumber: page }))
        }
        onPageSizeChange={(value) =>
          setFilters((prev) => ({ ...prev, pageSize: value, pageNumber: 1 }))
        }
      />
    </div>
  );
};

export default CashVouchersPage;
