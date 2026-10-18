// Supplier invoices list page.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import InvoiceFilters from '../shared/components/invoice-filter';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import {
  useCustomers,
  useInvoices,
  useInvoiceTypes,
  useSuppliers,
} from '../shared/hooks/invoices.queries';
import { buildStandardPageColumns } from '../shared/utils/invoice-columns';

const pageType = 'supplier';

const SupplierInvoicesPage = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useInvoices(filters, pageType);
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();

  const { items = [], totalPages = 1 } = data || {};

  const columns = buildStandardPageColumns({
    partyNameKey: 'supplierNameAr',
    partyLabel: 'العميل / الشركة',
    navigate,
  });

  const onAddInvoice = () => {
    navigate(`/suppliers-invoices/new`);
  };

  return (
    <div className="min-w-0 space-y-6 p-6">
      <div className="flex justify-between items-center bg-white rounded-xl p-6 border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold">فواتير الموردين</h1>
          <p className="text-sm text-gray-600">
            إدارة فواتير الموردين من مكان واحد
          </p>
        </div>

        <button
          onClick={onAddInvoice}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={16} />
          إضافة فاتورة
        </button>
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

export default SupplierInvoicesPage;
