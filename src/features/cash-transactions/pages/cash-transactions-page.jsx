import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import {
  useCashTransactions,
  useCashTransactionsBalance,
} from '../hooks/cash-transactions.queries';
import { useDeleteCashTransaction } from '../hooks/cash-transactions.mutations';

const CashTransactionsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    transactionNumber: '',
    transactionType: '',
    status: '',
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'EntryDate',
    sortDirection: 'DESC',
  });

  const { data, isLoading } = useCashTransactions(filters);
  const { data: balance } = useCashTransactionsBalance();
  const deleteMutation = useDeleteCashTransaction();

  const items = data?.items || [];
  const totalCount = Number(items[0]?.totalCount) > 0 ? Number(items[0].totalCount) : items.length;
  const totalPages = Math.max(Math.ceil(totalCount / (filters.pageSize || 10)), 1);

  const columns = useMemo(
    () => [
      { header: 'رقم الحركة', key: 'journalEntryNumber' },
      {
        header: 'التاريخ',
        key: 'entryDate',
        type: 'custom',
        render: (row) => (row.entryDate ? new Date(row.entryDate).toLocaleDateString('ar-EG') : '-'),
      },
      { header: 'النوع', key: 'transactionType' },
      { header: 'الوصف', key: 'descriptionAr' },
      { header: 'المرجع', key: 'referenceNumber' },
      { header: 'القيمة', key: 'amount' },
      { header: 'الحساب المقابل', key: 'oppositeAccountNameAr' },
      { header: 'الحالة', key: 'status' },
      {
        header: 'الإجراءات',
        key: 'actions',
        type: 'custom',
        render: (row) => (
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/cash-transactions/${row.journalEntryID}`)} className="text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
            <button onClick={() => navigate(`/cash-transactions/${row.journalEntryID}`)} className="text-green-600 hover:text-green-800"><Pencil size={18} /></button>
            <button onClick={() => deleteMutation.mutate({ id: row.journalEntryID, reason: 'Deleted from UI' })} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
          </div>
        ),
      },
    ],
    [deleteMutation, navigate]
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">الحركات النقدية</h1>
          <p className="text-sm text-gray-600">إدارة الإيداعات والسحوبات النقدية</p>
        </div>
        <button onClick={() => navigate('/cash-transactions/new')} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          <Plus size={16} /> إضافة حركة نقدية
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-gray-500"><Wallet size={18} /> إجمالي الإيداعات</div>
          <div className="text-2xl font-bold text-green-600">{balance?.totalDeposits ?? 0}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-gray-500"><Wallet size={18} /> إجمالي السحوبات</div>
          <div className="text-2xl font-bold text-red-600">{balance?.totalWithdrawals ?? 0}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-gray-500"><Wallet size={18} /> الرصيد</div>
          <div className={`text-2xl font-bold ${(balance?.balance ?? 0) >= 0 ? 'text-primary' : 'text-red-600'}`}>{balance?.balance ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <FormInput label="بحث برقم الحركة" value={filters.transactionNumber} onChange={(event) => setFilters((prev) => ({ ...prev, transactionNumber: event.target.value, pageNumber: 1 }))} placeholder="CASH-DEP..." />
        <FormInput as="select" label="نوع الحركة" value={filters.transactionType} onChange={(event) => setFilters((prev) => ({ ...prev, transactionType: event.target.value, pageNumber: 1 }))}>
          <option value="">الكل</option>
          <option value="Deposit">إيداع</option>
          <option value="Withdrawal">سحب</option>
        </FormInput>
        <FormInput as="select" label="الحالة" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value, pageNumber: 1 }))}>
          <option value="">الكل</option>
          <option value="Draft">Draft</option>
          <option value="Posted">Posted</option>
        </FormInput>
      </div>

      <Table columns={columns} data={items} loading={isLoading} />

      <Pagination
        currentPage={filters.pageNumber}
        totalPages={totalPages}
        pageSize={filters.pageSize}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, pageNumber: page }))}
        onPageSizeChange={(value) => setFilters((prev) => ({ ...prev, pageSize: value, pageNumber: 1 }))}
      />
    </div>
  );
};

export default CashTransactionsPage;
