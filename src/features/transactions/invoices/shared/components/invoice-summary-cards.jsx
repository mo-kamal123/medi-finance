import { Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/format-currency';

const InvoiceSummaryCards = ({ invoice, totals }) => {
  if (!invoice?.invoiceID) return null;

  const totalAmount = totals?.totalAmount ?? invoice.totalAmount ?? 0;
  const netAmount = totals?.netAmount ?? invoice.netAmount ?? 0;
  const taxAmount = totals?.taxAmount ?? invoice.taxAmount ?? 0;
  const totalDiscounts =
    totals?.totalDiscounts ??
    invoice.totalDiscounts ??
    invoice.discountAmount ??
    0;
  const paidAmount = invoice.paidAmount ?? 0;
  const remainingAmount = totals
    ? netAmount - paidAmount
    : (invoice.remainingAmount ?? netAmount - paidAmount);
  const items = [
    { label: 'إجمالي الفاتورة', value: totalAmount, color: 'text-gray-900' },
    { label: 'إجمالي الخصومات', value: totalDiscounts, color: 'text-rose-600' },
    { label: 'الضريبة', value: taxAmount, color: 'text-gray-900' },
    { label: 'المدفوع', value: paidAmount, color: 'text-emerald-600' },
    { label: 'المتبقي', value: remainingAmount, color: 'text-amber-700' },
  ];

  return (
    <section
      aria-label="ملخص مبالغ الفاتورة"
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="flex shrink-0 items-center gap-4 border-b border-primary/10 bg-primary/5 px-6 py-6 lg:w-72 lg:border-b-0 lg:border-e">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
            <Wallet size={24} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-primary">صافي الفاتورة</h2>
            <p
              className="mt-2 text-2xl font-bold tabular-nums text-primary"
              dir="ltr"
            >
              {formatCurrency(netAmount)}
            </p>
          </div>
        </div>
        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-5 p-6 sm:grid-cols-3 xl:grid-cols-5">
          {items.map(({ label, value, color }) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-gray-500">{label}</dt>
              <dd
                className={`mt-2 w-fit max-w-full wrap-break-word text-lg font-semibold tabular-nums ${color}`}
                dir="ltr"
              >
                {formatCurrency(value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default InvoiceSummaryCards;
