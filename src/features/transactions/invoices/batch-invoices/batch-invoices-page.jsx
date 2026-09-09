// Batch invoices list page.

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvoiceFilters from '../shared/components/invoice-filter';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
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

  const { items = [], totalPages = 1, totalCount = 0 } = data || {};

  const columns = useMemo(() => buildBatchPageColumns({ navigate }), [navigate]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">فواتير المطالبات</h1>
          <p className="text-sm text-gray-600">
            متابعة الفواتير التي تم إنشاؤها من دفعات المطالبات
          </p>
        </div>

        <button
          onClick={() => navigate('/batches-invoices/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          إنشاء فاتورة دفعة
        </button>
      </div>

      <InvoiceFilters
        filters={filters}
        setFilters={setFilters}
        invoiceTypes={invoiceTypes}
        customers={customers}
        suppliers={suppliers}
      />

      <Table
        columns={columns}
        data={items}
        loading={isLoading}
        onRowClick={(row) => navigate(`/invoices/${row.invoiceID}`)}
      />

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
