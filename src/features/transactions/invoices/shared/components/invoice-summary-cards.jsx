import KpiCard from '../../../../../shared/ui/kpi-card';
import { formatCurrency } from '../utils/format-currency';

const InvoiceSummaryCards = ({ invoice, totals, showPayments = true }) => {
  if (!invoice?.invoiceID && !totals) return null;

  const totalAmount = totals?.totalAmount ?? invoice?.totalAmount ?? 0;
  const netAmount = totals?.netAmount ?? invoice?.netAmount ?? 0;
  const taxAmount = totals?.taxAmount ?? invoice?.taxAmount ?? 0;
  const totalDiscounts =
    totals?.totalDiscounts ??
    invoice?.totalDiscounts ??
    invoice?.discountAmount ??
    0;
  const paidAmount = invoice?.paidAmount ?? 0;
  const remainingAmount = totals
    ? netAmount - paidAmount
    : (invoice?.remainingAmount ?? netAmount - paidAmount);
  const items = [
    { label: 'إجمالي الفاتورة', value: totalAmount, color: 'text-gray-900' },
    { label: 'إجمالي الخصومات', value: totalDiscounts, color: 'text-rose-600' },
    { label: 'الضريبة', value: taxAmount, color: 'text-gray-900' },
    ...(showPayments
      ? [
          { label: 'المدفوع', value: paidAmount, color: 'text-emerald-600' },
          { label: 'المتبقي', value: remainingAmount, color: 'text-amber-700' },
        ]
      : []),
  ];

  return (
    <section
      aria-label="ملخص مبالغ الفاتورة"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <KpiCard label="صافي الفاتورة" value={formatCurrency(netAmount)} />
      {items.map(({ label, value, color }) => (
        <KpiCard
          key={label}
          label={label}
          value={formatCurrency(value)}
          tone={color}
        />
      ))}
    </section>
  );
};

export default InvoiceSummaryCards;
