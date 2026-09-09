// Edit-mode summary cards (total / net / paid / remaining).

import { formatCurrency } from '../utils/format-currency';

const InvoiceSummaryCards = ({ invoice }) => {
  if (!invoice?.invoiceID) return null;

  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-4">
      <div>
        <p className="text-sm text-gray-500">الإجمالي</p>
        <p className="font-semibold text-gray-900">
          {formatCurrency(invoice.totalAmount ?? 0)}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500">الصافي</p>
        <p className="font-semibold text-primary">
          {formatCurrency(invoice.netAmount ?? 0)}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500">المدفوع</p>
        <p className="font-semibold text-green-600">
          {formatCurrency(invoice.paidAmount ?? 0)}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500">المتبقي</p>
        <p className="font-semibold text-red-600">
          {formatCurrency(invoice.remainingAmount ?? 0)}
        </p>
      </div>
    </div>
  );
};

export default InvoiceSummaryCards;
