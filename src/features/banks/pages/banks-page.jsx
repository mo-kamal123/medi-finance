import { useState } from 'react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import FormInput from '../../../shared/ui/input';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import ConfirmModal from '../../../shared/ui/modal';
import { paginateItems } from '../../../shared/utils/list-utils';
import { useBanks } from '../hooks/banks.queries';
import { useDeleteBank } from '../hooks/banks.mutations';

const BanksPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteBank } = useDeleteBank();

  const filters = {
    ...(search ? { search } : {}),
    ...(isActive === '' ? {} : { isActive: isActive === 'true' }),
  };

  const { data = [], isLoading } = useBanks(filters);
  const pagination = paginateItems(data, pageNumber, pageSize);

  const columns = [
    { header: 'كود البنك', key: 'bankCode' },
    { header: 'الاسم بالعربية', key: 'bankNameAr' },
    { header: 'الاسم بالإنجليزية', key: 'bankNameEn' },
    { header: 'Swift Code', key: 'swiftCode' },
    { header: 'الهاتف', key: 'phone' },
    { header: 'عدد الحسابات', key: 'accountCount' },
    {
      header: 'الحالة',
      key: 'isActive',
      type: 'custom',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.isActive
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {row.isActive ? 'نشط' : 'غير نشط'}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      type: 'custom',
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/banks/${row.bankID}`)}
            className="text-blue-600 hover:text-blue-800"
            title="عرض"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-red-500 hover:text-red-700"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-6">
      <Breadcrumb items={[{ label: 'البنوك' }]} />

      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold">البنوك</h1>
          <p className="text-sm text-gray-600">إدارة بيانات البنوك</p>
        </div>

        <button
          onClick={() => navigate('/banks/new')}
          className="bg-primary text-white px-4 py-2 flex items-center gap-3 rounded-lg hover:bg-primary/90"
        >
          <Plus size={16} /> إضافة بنك
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
          placeholder="اسم البنك أو الكود"
        />

        <FormInput
          as="select"
          label="الحالة"
          value={isActive}
          onChange={(event) => {
            setIsActive(event.target.value);
            setPageNumber(1);
          }}
        >
          <option value="">كل الحالات</option>
          <option value="true">نشط</option>
          <option value="false">غير نشط</option>
        </FormInput>
      </div>

      <Table columns={columns} data={pagination.items} loading={isLoading} onRowClick={(row) => navigate(`/banks/${row.bankID}`)} />

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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            setIsDeleting(true);
            deleteBank(deleteTarget.bankID, {
              onSettled: () => setIsDeleting(false),
            });
          }
          setDeleteTarget(null);
        }}
        isLoading={isDeleting}
        loadingText="جاري الحذف..."
        title="تأكيد حذف البنك"
        description={`هل أنت متأكد من حذف البنك "${deleteTarget?.bankNameAr}"؟`}
        confirmText="نعم، حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default BanksPage;
