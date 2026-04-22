import { useMemo, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvoiceFilters from '../components/invoice-filter';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { paginateItems } from '../../../shared/utils/list-utils';
import { getStatusStyle } from '../utils/status-style';
import {
  useCustomers,
  useInvoices,
  useInvoiceTypes,
  useSuppliers,
} from '../hooks/invoices.queries';
import { formatCurrency } from '../utils/format-currency';

const getBatchNumber = (row) => {
  if (row.batchNumber) return row.batchNumber;
  if (row.invoiceNumber?.startsWith('INV-BATCH-')) {
    return row.invoiceNumber.replace('INV-BATCH-', '');
  }
  return '-';
};

const BatchInvoicesPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data = [], isLoading } = useInvoices(filters, 'batch');
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();

  const pagination = useMemo(
    () =>
      paginateItems(
        data || [],
        filters.pageNumber || 1,
        filters.pageSize || 10
      ),
    [data, filters.pageNumber, filters.pageSize]
  );

  const columns = useMemo(
    () => [
      {
        header: 'رقم الفاتورة',
        key: 'invoiceNumber',
      },
      {
        header: 'رقم الدفعة',
        key: 'batchNumber',
        type: 'custom',
        render: (row) => getBatchNumber(row),
      },
      {
        header: 'المورد',
        key: 'supplierNameAr',
        type: 'custom',
        render: (row) => row.supplierNameAr || row.customerNameAr || '-',
      },
      {
        header: 'تاريخ الفاتورة',
        key: 'invoiceDate',
        type: 'custom',
        render: (row) =>
          row.invoiceDate
            ? new Date(row.invoiceDate).toLocaleDateString('ar-EG')
            : '-',
      },
      {
        header: 'الإجمالي',
        key: 'totalAmount',
        type: 'custom',
        render: (row) => formatCurrency(row.totalAmount),
      },
      {
        header: 'الخصم',
        key: 'discount',
        type: 'custom',
        render: (row) => (
          <span className="text-red-500">
            {formatCurrency((row.totalAmount || 0) - (row.netAmount || 0))}
          </span>
        ),
      },
      {
        header: 'الصافي',
        key: 'netAmount',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold text-primary">
            {formatCurrency(row.netAmount)}
          </span>
        ),
      },
      {
        header: 'الحالة',
        key: 'status',
        type: 'custom',
        render: (row) => (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
              row.status
            )}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        header: 'الإجراءات',
        key: 'actions',
        type: 'custom',
        render: (row) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/invoices/${row.invoiceID}`)}
              className="text-blue-600 hover:text-blue-800"
              title="عرض"
            >
              <Eye size={18} />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

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

      <Table columns={columns} data={pagination.items} loading={isLoading} />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
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
