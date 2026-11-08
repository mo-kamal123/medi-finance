import PageHeading from '../../../../shared/ui/page-heading';
import { useEffect, useState } from 'react';
import FormInput from '../../../../shared/ui/input';
import FilterBar from '../../../../shared/ui/filter-bar';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import PageLoader from '../../../../shared/ui/page-loader';
import Pagination from '../../../../shared/ui/pagination';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import CustomerTable from '../components/customer-table';
import { useCustomers, useCustomerCategories } from '../hooks/customers.queries';
import { Users, Search } from 'lucide-react';

const CustomersPage = () => {
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: categories = [], isLoading: isLoadingCategories } = useCustomerCategories();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
      setPageNumber(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const { data: response, isLoading } = useCustomers({
    ...Object.fromEntries(
      Object.entries(appliedFilters)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== '')
    ),
    pageNumber,
    pageSize,
  });

  const { items: customers = [], totalPages = 1 } = response || {};

  if (isLoading) return <PageLoader label="جاري تحميل العملاء..." />;

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: 'العملاء' }]} />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <PageHeading icon={<Users size={20} />}>
            <h1 className="text-2xl font-bold">العملاء</h1>
            <p className="text-sm text-gray-600">إدارة جميع العملاء</p>
          </PageHeading>
        </div>
      </div>

      <FilterBar
        gridClassName="lg:grid-cols-4 xl:grid-cols-4!"
        activeCount={
          Object.values(filters).filter((value) => value.trim()).length
        }
        onReset={() => {
          setFilters({});
          setAppliedFilters({});
          setPageNumber(1);
        }}
        primaryFilters={[
          <FormInput
            key="search"
            label="بحث"
            aria-label="بحث"
            value={filters.search ?? ''}
            icon={Search}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                search: event.target.value,
              }))
            }
            placeholder="ابحث بالكود أو الاسم"
            autoFocus
          />,
          <SearchableSelect
            key="status"
            label="الحالة"
            placeholder="جميع الحالات"
            value={filters.status ?? ''}
            options={[
              { value: '', label: 'جميع الحالات' },
              { value: 'Deactived', label: 'Deactived' },
              { value: 'Activated', label: 'Activated' },
              { value: 'Hold', label: 'Hold' },
            ]}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                status: event.target.value,
              }))
            }
          />,
          <SearchableSelect
            key="category"
            label="التصنيف"
            placeholder={isLoadingCategories ? 'جاري تحميل التصنيفات...' : 'كل التصنيفات'}
            value={filters.category ?? ''}
            disabled={isLoadingCategories}
            options={[
              { value: '', label: 'كل التصنيفات' },
              ...categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            ]}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                category: event.target.value,
              }))
            }
          />,
          <FormInput
            key="clientType"
            label="نوع العميل"
            aria-label="نوع العميل"
            placeholder="أدخل نوع العميل"
            value={filters.clientType ?? ''}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                clientType: event.target.value,
              }))
            }
          />,
        ]}
      />

      <CustomerTable data={customers} />

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
