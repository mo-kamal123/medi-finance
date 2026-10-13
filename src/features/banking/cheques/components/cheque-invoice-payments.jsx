import FormInput from '../../../../shared/ui/input';
import { formatCurrency } from '../../../../shared/utils/formatters';

const ChequeInvoicePayments = ({ payments }) => (
  <section
    aria-labelledby="cheque-invoice-payments-title"
    className="space-y-4"
  >
    <h3
      id="cheque-invoice-payments-title"
      className="text-base font-bold text-gray-700"
    >
      الفواتير المرتبطة بالشيك ({payments.length})
    </h3>
    {payments.length > 0 ? (
      <div className="space-y-3">
        {payments.map((payment, index) => (
          <div
            key={`${payment.invoiceID}-${index}`}
            className="grid grid-cols-1 items-end gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:grid-cols-2"
          >
            <FormInput
              label="رقم الفاتورة"
              aria-label={`رقم الفاتورة ${index + 1}`}
              value={payment.invoiceNumber ?? ''}
              readOnly
              inputClass="bg-white"
            />
            <FormInput
              label="المبلغ"
              aria-label={`مبلغ الفاتورة ${index + 1}`}
              value={formatCurrency(payment.amount ?? 0)}
              readOnly
              inputClass="bg-white tabular-nums"
            />
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">لا توجد فواتير مرتبطة بهذا الشيك.</p>
    )}
  </section>
);

export default ChequeInvoicePayments;
