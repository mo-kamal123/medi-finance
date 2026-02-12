import InvoiceRow from './invoice-row';

const InvoiceTable = ({ invoices }) => {
  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full table-auto text-left border-collapse">
          <thead className="bg-primary/90">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-white">
                رقم الفاتورة
              </th>
              <th className="px-4 py-3 text-sm font-medium text-white">
                العميل
              </th>
              <th className="px-4 py-3 text-sm font-medium text-white">
                التاريخ
              </th>
              <th className="px-4 py-3 text-sm font-medium text-white">
                المبلغ
              </th>
              <th className="px-4 py-3 text-sm font-medium text-white">
                الحالة
              </th>
              <th className="px-4 py-3 text-sm font-medium text-white">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTable;
