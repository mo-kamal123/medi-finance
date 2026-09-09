// Table column factories for the invoice list pages.

import { Eye, Trash2 } from 'lucide-react';
import { formatDate } from '../../../../../shared/utils/formatters';
import { formatCurrency } from './format-currency';
import { getStatusStyle } from './status-style';

// Standard invoice page (customers / suppliers)
export const buildStandardPageColumns = ({
  partyNameKey,
  partyLabel,
  navigate,
  setDeleteTarget,
}) => [
  {
    header: 'رقم الفاتورة',
    key: 'invoiceNumber',
  },
  {
    header: partyLabel,
    key: partyNameKey,
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

// ---------------------------------------------------------------------------
// Batch invoice page
// ---------------------------------------------------------------------------

const getBatchNumber = (row) => {
  if (row.batchNumber) return row.batchNumber;
  if (row.invoiceNumber?.startsWith('INV-BATCH-')) {
    return row.invoiceNumber.replace('INV-BATCH-', '');
  }
  return '-';
};

/**
 * Build the column set for the batch invoice list page.
 *
 * @param {Object}   options
 * @param {Function} options.navigate  React Router navigate callback.
 */
export const buildBatchPageColumns = ({ navigate }) => [
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
    render: (row) => formatDate(row.invoiceDate),
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
];
