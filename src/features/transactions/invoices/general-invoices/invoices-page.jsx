import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import PageHeading from '../../../../shared/ui/page-heading';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import Table from '../../../../shared/ui/table';
import Pagination from '../../../../shared/ui/pagination';
import { useInvoices } from '../shared/hooks/invoices.queries';
import { buildStandardPageColumns } from '../shared/utils/invoice-columns';

const GeneralInvoicesPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ pageNumber: 1, pageSize: 10 });
  const { data, isLoading, isError, refetch } = useInvoices(filters, 'general');
  const changeFilter = (name, value) =>
    setFilters((prev) => ({ ...prev, [name]: value, pageNumber: 1 }));
  const columns = buildStandardPageColumns({
    partyNameKey: 'descriptionAr',
    partyLabel: 'الوصف',
    navigate,
  });
  columns.splice(2, 0, {
    header: 'مصدر الدفع',
    key: 'paymentSource',
    type: 'custom',
    render: (row) =>
      row.paymentSource === 'Cash'
        ? 'نقدي'
        : row.paymentSource === 'Bank'
          ? 'بنك'
          : '-',
  });
  return (
    <div className="min-w-0 space-y-6 p-6">
      <Breadcrumb items={[{ label: 'الفواتير العامة' }]} />
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <PageHeading icon={<FileText size={20} />}>
          <h1 className="text-2xl font-bold">الفواتير العامة</h1>
          <p className="text-sm text-gray-600">إدارة فواتير المصروفات العامة</p>
        </PageHeading>
        <button
          onClick={() => navigate('/general-invoices/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          إضافة فاتورة
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-3">
        <FormInput
          label="رقم الفاتورة"
          value={filters.invoiceNumber ?? ''}
          onChange={(event) =>
            changeFilter('invoiceNumber', event.target.value)
          }
        />
        <DateInput
          label="من تاريخ"
          value={filters.fromDate ?? ''}
          onChange={(event) => changeFilter('fromDate', event.target.value)}
        />
        <DateInput
          label="إلى تاريخ"
          value={filters.toDate ?? ''}
          onChange={(event) => changeFilter('toDate', event.target.value)}
        />
        <button
          type="button"
          onClick={() =>
            setFilters({ pageNumber: 1, pageSize: filters.pageSize })
          }
          className="justify-self-start text-sm text-primary"
        >
          إعادة تعيين الفلاتر
        </button>
      </div>
      {isError ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800"
        >
          تعذر تحميل الفواتير العامة.{' '}
          <button onClick={() => refetch()} className="underline">
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="min-w-0 [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
          <Table
            columns={columns}
            data={data?.items ?? []}
            loading={isLoading}
            onRowClick={(row) => navigate(`/invoices/${row.invoiceID}`)}
          />
        </div>
      )}
      <Pagination
        currentPage={filters.pageNumber}
        totalPages={data?.totalPages ?? 1}
        pageSize={filters.pageSize}
        onPageChange={(pageNumber) =>
          setFilters((prev) => ({ ...prev, pageNumber }))
        }
        onPageSizeChange={(pageSize) =>
          setFilters((prev) => ({ ...prev, pageSize, pageNumber: 1 }))
        }
      />
    </div>
  );
};
export default GeneralInvoicesPage;
