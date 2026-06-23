import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import { useDebounce } from '../../../shared/lib/use-debounce';
import CustomerTable from '../components/customer-table';
import { useDeleteCustomer } from '../hooks/customers.mutations';
import { useCustomers } from '../hooks/customers.queries';

const ACTIVE_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'true', label: 'نشط' },
  { value: 'false', label: 'غير نشط' },
];

const CustomersPage = () => {
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearchTerm = useDebounce(search, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDebouncedSearch(debouncedSearchTerm);
    setPageNumber(1);
  }, [debouncedSearchTerm]);

  const { data: response, isLoading } = useCustomers({
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
    pageNumber,
    pageSize,
  });

  const { items: customers = [], totalPages = 1 } = response || {};

  if (isLoading) {
    return <PageLoader label="جاري تحميل العملاء..." />;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">العملاء</h1>
          <p className="text-sm text-gray-600">إدارة جميع العملاء بسهولة</p>
        </div>

        <button
          onClick={() => navigate('/customers/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          عميل جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2">
        <FormInput
          label="بحث"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث بالكود أو الاسم أو الهاتف"
          autoFocus
        />
        <SearchableSelect
          label="الحالة"
          value={isActive}
          onChange={(event) => {
            setIsActive(event.target.value);
            setPageNumber(1);
          }}
          placeholder="الكل"
          options={ACTIVE_OPTIONS}
        />
      </div>

      <CustomerTable
        data={customers}
        onDelete={(customerID) => deleteCustomer(customerID)}
      />

      <Pagination
        currentPage={pageNumber}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPageNumber}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPageNumber(1);
        }}
      />
    </div>
  );
};

export default CustomersPage;
