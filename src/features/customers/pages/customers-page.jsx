import { useEffect, useRef, useState } from 'react';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import { useDebounce } from '../../../shared/lib/use-debounce';
import CustomerTable from '../components/customer-table';
import { useCustomers } from '../hooks/customers.queries';

const CustomersPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearchTerm = useDebounce(search, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setDebouncedSearch(debouncedSearchTerm);
    setPageNumber(1);
  }, [debouncedSearchTerm]);

  const { data: response, isLoading } = useCustomers({
    search: debouncedSearch || undefined,
    pageNumber,
    pageSize,
  });

  const { items: customers = [], totalPages = 1 } = response || {};

  if (isLoading) return <PageLoader label="جاري تحميل العملاء..." />;

  return (
    <div className="space-y-4 p-6">
      <Breadcrumb items={[{ label: 'العملاء' }]} />
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">العملاء</h1>
        <p className="text-sm text-gray-600">إدارة جميع العملاء</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <FormInput
          label="بحث"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالكود أو الاسم"
          autoFocus
        />
      </div>

      <CustomerTable data={customers} />

      <Pagination
        currentPage={pageNumber}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPageNumber}
        onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
      />
    </div>
  );
};

export default CustomersPage;
