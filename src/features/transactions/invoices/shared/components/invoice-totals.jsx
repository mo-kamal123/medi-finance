// Totals cards + submit button.

import { formatCurrency } from '../utils/format-currency';

const InvoiceTotals = ({ totalAmount, totalDiscounts, netAmount, isLoading }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
      <div className="rounded-xl bg-white p-4 border border-gray-200">
        <p className="text-sm text-gray-500">إجمالي الفاتورة</p>
        <p className="mt-2 text-lg font-semibold text-gray-900">
          {formatCurrency(totalAmount)}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 border border-gray-200">
        <p className="text-sm text-gray-500">إجمالي الخصومات</p>
        <p className="mt-2 text-lg font-semibold text-red-500">
          {formatCurrency(totalDiscounts)}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 border border-gray-200">
        <p className="text-sm text-gray-500">صافي الفاتورة</p>
        <p className="mt-2 text-lg font-semibold text-primary">
          {formatCurrency(netAmount)}
        </p>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={isLoading}
        className="px-8 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
      >
        حفظ الفاتورة
      </button>
    </div>
  </div>
);

export default InvoiceTotals;
