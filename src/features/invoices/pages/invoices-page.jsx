import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Plus, Trash2 } from 'lucide-react';

import InvoiceFilters from '../components/invoice-filter';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import ConfirmModal from '../../../shared/ui/modal';
import { formatDate } from '../../../shared/utils/formatters';
import { getStatusStyle } from '../utils/status-style';
import {
  useCustomers,
  useInvoices,
  useInvoiceTypes,
  useSuppliers,
} from '../hooks/invoices.queries';
import { useDeleteInvoice } from '../hooks/invoices.mutations';
import { formatCurrency } from '../utils/format-currency';

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
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useInvoices(filters, pageType);
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

  const { items = [], totalPages = 1, totalCount = 0 } = data || {};

  const columns = [
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
      render: (row) => formatDate(row.invoiceDate),
    },
    {
      header: 'الإجمالي',
      key: 'totalAmount',
      type: 'custom',
      render: (row) => formatCurrency(row.totalAmount),
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
      header: 'المدفوع',
      key: 'paidAmount',
      type: 'custom',
      render: (row) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(row.paidAmount ?? 0)}
        </span>
      ),
    },
    {
      header: 'المتبقي',
      key: 'remainingAmount',
      type: 'custom',
      render: (row) => (
        <span className="font-semibold text-red-600">
          {formatCurrency(row.remainingAmount ?? 0)}
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
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-red-600 hover:text-red-800"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const onAddInvoice = () => {
    navigate(`/invoices/new?type=${newInvoiceType}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold">
            {pageType === 'customer' ? 'فواتير العملاء' : 'فواتير الموردين'}
          </h1>
          <p className="text-sm text-gray-600">
            {pageType === 'customer'
              ? 'إدارة فواتير العملاء من مكان واحد'
              : 'إدارة فواتير الموردين من مكان واحد'}
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

      <Table columns={columns} data={items} loading={isLoading} onRowClick={(row) => navigate(`/invoices/${row.invoiceID}`)} />

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

export default InvoicesPage;
