import FormInput from '../../../../../shared/ui/input';
import { formatDate } from '../../../../../shared/utils/formatters';
import { formatCurrency } from '../utils/format-currency';

const BatchInvoiceDetails = ({ invoice }) => {
  const fields = [
    ['رقم الفاتورة', invoice.invoiceNumber],
    ['نوع الفاتورة', invoice.invoiceTypeNameAr || invoice.invoiceTypeNameEn],
    ['تاريخ الإصدار', formatDate(invoice.invoiceDate)],
    ['تاريخ الاستحقاق', formatDate(invoice.dueDate)],
    [
      'المورد',
      invoice.supplierNameAr || invoice.supplierName || invoice.supplierNameEn,
    ],
    ['كود المورد', invoice.supplierCode],
    ['رقم الدفعة', invoice.batchNumber ?? invoice.batchID],
    [
      'الفترة المالية',
      invoice.financialPeriodNameAr || invoice.financialPeriodNameEn,
    ],
    ['الحالة', invoice.status],
  ];
  const details = invoice.details ?? invoice.invoiceDetails ?? [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {fields.map(([label, value]) => (
          <FormInput
            key={label}
            label={label}
            aria-label={label}
            value={value ?? ''}
            readOnly
            inputClass="bg-gray-50 text-gray-900"
          />
        ))}
      </div>
      <section aria-labelledby="batch-services-title" className="space-y-4">
        <h2
          id="batch-services-title"
          className="text-xl font-semibold text-gray-800"
        >
          تفاصيل الخدمات
        </h2>
        <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>
                {['الخدمة', 'العميل', 'الإجمالي'].map(
                  (label) => (
                    <th
                      key={label}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-right font-medium"
                    >
                      {label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => {
                const values = [
                  [
                    'الخدمة',
                    detail.serviceNameAr ||
                      detail.serviceNameEn ||
                      detail.productServiceNameAr ||
                      detail.productServiceNameEn ||
                      '',
                  ],
                  [
                    'العميل',
                    detail.customerNameAr ||
                      detail.customerName ||
                      detail.customerNameEn ||
                      '',
                  ],
                  ['الإجمالي', formatCurrency(detail.totalAmount ?? 0)],
                ];
                return (
                  <tr
                    key={
                      detail.invoiceDetailID ?? detail.batchDetailID ?? index
                    }
                    className="border-t border-gray-100 even:bg-gray-50/50"
                  >
                    {values.map(([label, value]) => (
                      <td key={label} className="p-3">
                        <input
                          type="text"
                          aria-label={`${label} ${index + 1}`}
                          value={value}
                          title={String(value)}
                          readOnly
                          size={Math.max(String(value).length + 2, 12)}
                          className="w-full min-w-36 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
              {details.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500">
                    لا توجد تفاصيل خدمات لهذه الفاتورة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BatchInvoiceDetails;
