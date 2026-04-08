import { useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { paginateItems } from '../../../shared/utils/list-utils';
import { useBanks } from '../hooks/banks.queries';

const BanksPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [isActive, setIsActive] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filters = {
    ...(search ? { search } : {}),
    ...(countryCode ? { countryCode } : {}),
    ...(isActive === '' ? {} : { isActive: isActive === 'true' }),
  };

  const { data = [], isLoading } = useBanks(filters);
  const pagination = paginateItems(data, pageNumber, pageSize);

  const columns = [
    { header: 'كود البنك', key: 'bankCode' },
    { header: 'الاسم بالعربية', key: 'bankNameAr' },
    { header: 'الاسم بالإنجليزية', key: 'bankNameEn' },
    { header: 'Swift Code', key: 'swiftCode' },
    { header: 'كود الدولة', key: 'countryCode' },
    { header: 'الهاتف', key: 'phone' },
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
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/banks/${row.bankID}`)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
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

      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
          label="كود الدولة"
          value={countryCode}
          onChange={(event) => {
            setCountryCode(event.target.value);
            setPageNumber(1);
          }}
          placeholder="EG"
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

export default BanksPage;
