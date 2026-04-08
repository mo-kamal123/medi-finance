import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';

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

const InvoicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pageType =
    location.pathname === '/customers-invoices' ? 'customer' : 'supplier';

  const newInvoiceType = pageType;

  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data = [], isLoading } = useInvoices(filters, pageType);
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
        header: 'العميل / الشركة',
        key: 'customerNameAr',
      },
      {
        header: 'نوع الفاتورة',
        key: 'invoiceTypeNameAr',
      },
      {
        header: 'تاريخ الفاتورة',
        key: 'invoiceDate',
        type: 'custom',
        render: (row) =>
          row.invoiceDate
            ? new Date(row.invoiceDate).toLocaleDateString()
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
            {formatCurrency(row.totalAmount - row.netAmount)}
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
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
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
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={() => navigate(`/invoices/${row.invoiceID}`)}
              className="text-blue-600 hover:text-blue-800"
              title="عرض"
            >
              <Eye size={18} />
            </button>

            {/* <button
              onClick={() => navigate(`/invoices/edit/${row.invoiceID}`)}
              className="text-green-600 hover:text-green-800"
              title="تعديل"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={() => console.log('delete invoice', row.invoiceID)}
              className="text-red-600 hover:text-red-800"
              title="حذف"
            >
              <Trash2 size={18} />
            </button> */}
          </div>
        ),
      },
    ],
    [navigate]
  );

  const onAddInvoice = () => {
    navigate(`/invoices/new?type=${newInvoiceType}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold">الفواتير</h1>
          <p className="text-sm text-gray-600">إدارة الفواتير من مكان واحد</p>
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

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(value);

export default InvoicesPage;
