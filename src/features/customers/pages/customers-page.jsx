import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import { matchesSearch, paginateItems } from '../../../shared/utils/list-utils';
import CustomerTable from '../components/customer-table';
import { useDeleteCustomer } from '../hooks/customers.mutations';
import { useCustomers } from '../hooks/customers.queries';

const CustomersPage = () => {
  const { data = [], isLoading } = useCustomers();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCustomers = useMemo(
    () =>
      data.filter((customer) =>
        matchesSearch(
          customer,
          [
            'customerCode',
            'customerNameAr',
            'customerNameEn',
            'phone',
            'email',
          ],
          search
        )
      ),
    [data, search]
  );

  const pagination = useMemo(
    () => paginateItems(filteredCustomers, pageNumber, pageSize),
    [filteredCustomers, pageNumber, pageSize]
  );

  if (isLoading) {
    return <PageLoader label="جاري تحميل العملاء..." />;
  }

  if (!data) {
    return null;
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

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <FormInput
          label="بحث"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPageNumber(1);
          }}
          placeholder="ابحث بالكود أو الاسم أو الهاتف"
        />
      </div>

      <CustomerTable
        data={pagination.items}
        onDelete={(customerID) => deleteCustomer(customerID)}
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

export default CustomersPage;
