import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoiceFilters from '../components/invoice-filter';
import { invoicesData } from '../utils/data';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import Table from '../../../shared/ui/table';
import { getStatusStyle } from '../utils/status-style';

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const transformedInvoices = invoicesData.filter((inv) => {
    const matchesSearch = inv.invoiceNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 🔹 Columns Definition
  const columns = [
    {
      header: 'رقم الفاتورة',
      key: 'invoiceNumber',
    },
    {
      header: 'الشركة / العميل',
      key: 'partyName',
    },
    {
      header: 'نوع الفاتورة',
      key: 'invoiceType',
    },
    {
      header: 'تاريخ الإصدار',
      key: 'invoiceDate',
      type: 'custom',
      render: (row) => new Date(row.invoiceDate).toLocaleDateString(),
    },
    {
      header: 'تاريخ الاستحقاق',
      key: 'dueDate',
      type: 'custom',
      render: (row) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      header: 'الإجمالي',
      key: 'subtotal',
      type: 'custom',
      render: (row) => formatCurrency(row.subtotal),
    },
    {
      header: 'الخصم',
      key: 'discount',
      type: 'custom',
      render: (row) => (
        <span className="text-red-500">{formatCurrency(row.discount)}</span>
      ),
    },
    {
      header: 'الصافي',
      key: 'net',
      type: 'custom',
      render: (row) => (
        <span className="font-semibold text-primary">
          {formatCurrency(row.net)}
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
          {/* View */}
          <button
            onClick={() => navigate(`/invoices/${row.id}`)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="عرض"
          >
            <Eye size={18} />
          </button>

          {/* Edit */}
          <button
            onClick={() => navigate(`/invoices/${row.id}`)}
            className="text-green-600 hover:text-green-800 transition-colors"
            title="تعديل"
          >
            <Pencil size={18} />
          </button>

          {/* Delete (اختياري) */}
          <button
            onClick={() => console.log('delete', row.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const onAddInvoice = () => {
    navigate('/invoices/new');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold">لوحة الفواتير</h1>
          <p className="text-sm text-gray-600">إدارة جميع الفواتير بسهولة</p>
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
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <Table columns={columns} data={transformedInvoices} />
    </div>
  );
};

// 🔹 Helpers

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('ar-eg', {
    style: 'currency',
    currency: 'EGY',
  }).format(value);

export default InvoicesPage;
