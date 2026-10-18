// Batch invoices list page.

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvoiceFilters from '../shared/components/invoice-filter';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import {
  useCustomers,
  useInvoices,
  useInvoiceTypes,
  useSuppliers,
} from '../shared/hooks/invoices.queries';
import { buildBatchPageColumns } from '../shared/utils/invoice-columns';

const BatchInvoicesPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useInvoices(filters, 'batch');
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();

  const { items = [], totalPages = 1 } = data || {};

  const columns = useMemo(
    () => buildBatchPageColumns({ navigate }),
    [navigate]
  );

  return (
    <div className="min-w-0 space-y-6 p-6">
      <Breadcrumb items={[{ label: 'فواتير المطالبات' }]} />
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold">فواتير المطالبات</h1>
          <p className="text-sm text-gray-600">
            متابعة الفواتير التي تم إنشاؤها من دفعات المطالبات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/batches-invoices/new')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            <Plus size={16} />
            إنشاء فاتورة دفعة
          </button>
        </div>
      </div>

      <InvoiceFilters
        filters={filters}
        setFilters={setFilters}
        invoiceTypes={invoiceTypes}
        customers={customers}
        suppliers={suppliers}
      />

      <div className="min-w-0 [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
        <Table
          columns={columns}
          data={items}
          loading={isLoading}
          onRowClick={(row) => navigate(`/invoices/${row.invoiceID}`)}
        />
      </div>

      <Pagination
        currentPage={filters.pageNumber}
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

export default BatchInvoicesPage;
