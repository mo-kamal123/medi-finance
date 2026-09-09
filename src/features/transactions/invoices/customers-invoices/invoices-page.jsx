// Customer invoices list page.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import InvoiceFilters from '../shared/components/invoice-filter';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import ConfirmModal from '../../../../shared/ui/modal';
import {
  useCustomers,
  useInvoices,
  useInvoiceTypes,
  useSuppliers,
} from '../shared/hooks/invoices.queries';
import { useDeleteInvoice } from '../shared/hooks/invoices.mutations';
import { buildStandardPageColumns } from '../shared/utils/invoice-columns';

const pageType = 'customer';
const newInvoiceType = 'customer';

const CustomerInvoicesPage = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useInvoices(filters, pageType);
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

  const { items = [], totalPages = 1, totalCount = 0 } = data || {};

  const columns = buildStandardPageColumns({
    partyNameKey: 'customerNameAr',
    partyLabel: 'العميل / الشركة',
    navigate,
    setDeleteTarget,
  });

  const onAddInvoice = () => {
    navigate(`/customers-invoices/new`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-white rounded-xl p-6 border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold">فواتير العملاء</h1>
          <p className="text-sm text-gray-600">
            إدارة فواتير العملاء من مكان واحد
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteInvoice(deleteTarget.invoiceID, {
              onSettled: () => setDeleteTarget(null),
            });
          }
        }}
        isLoading={isDeleting}
        loadingText="جاري الحذف..."
        title="تأكيد حذف الفاتورة"
        description={`هل أنت متأكد من حذف الفاتورة "${deleteTarget?.invoiceNumber}"؟`}
        confirmText="نعم، حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default CustomerInvoicesPage;
