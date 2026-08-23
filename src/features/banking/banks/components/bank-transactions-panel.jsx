const STATIC_TRANSACTIONS = [
  {
    transactionNumber: 'TXN-2026-001',
    transactionDate: '2026-08-15',
    bankAccount: '1234567890',
    transactionType: 'إيداع',
    amount: 150000.00,
    currency: 'SAR',
    description: 'تحويل رواتب الموظفين',
    beneficiaryPayer: 'شركة أرامكو',
    relatedDocument: 'DOC-2026-045',
    status: 'معتمد',
    journalEntry: 'JE-2026-0892',
  },
  {
    transactionNumber: 'TXN-2026-002',
    transactionDate: '2026-08-14',
    bankAccount: '1234567890',
    transactionType: 'سحب',
    amount: -35000.00,
    currency: 'SAR',
    description: 'دفع فاتورة مورد',
    beneficiaryPayer: 'شركة التقنية',
    relatedDocument: 'INV-2026-112',
    status: 'معتمد',
    journalEntry: 'JE-2026-0893',
  },
  {
    transactionNumber: 'TXN-2026-003',
    transactionDate: '2026-08-13',
    bankAccount: '0987654321',
    transactionType: 'تحويل',
    amount: 75000.00,
    currency: 'USD',
    description: 'تحويل دولي - دفعة عقود',
    beneficiaryPayer: 'Global Corp',
    relatedDocument: 'CTR-2026-078',
    status: 'قيد المراجعة',
    journalEntry: '-',
  },
  {
    transactionNumber: 'TXN-2026-004',
    transactionDate: '2026-08-12',
    bankAccount: '1234567890',
    transactionType: 'رسوم بنكية',
    amount: -250.00,
    currency: 'SAR',
    description: 'رسوم التحويل الدولي',
    beneficiaryPayer: 'البنك الأهلي',
    relatedDocument: '-',
    status: 'معتمد',
    journalEntry: 'JE-2026-0895',
  },
  {
    transactionNumber: 'TXN-2026-005',
    transactionDate: '2026-08-11',
    bankAccount: '0987654321',
    transactionType: 'إيداع',
    amount: 220000.00,
    currency: 'SAR',
    description: 'إيداع مبيعات نقدي',
    beneficiaryPayer: 'عميل نقدي',
    relatedDocument: 'RCP-2026-334',
    status: 'معتمد',
    journalEntry: 'JE-2026-0896',
  },
  {
    transactionNumber: 'TXN-2026-006',
    transactionDate: '2026-08-10',
    bankAccount: '1234567890',
    transactionType: 'سحب',
    amount: -12500.00,
    currency: 'SAR',
    description: 'صرف رواتب',
    beneficiaryPayer: 'الموظفين',
    relatedDocument: 'PAY-2026-089',
    status: 'قيد المراجعة',
    journalEntry: '-',
  },
  {
    transactionNumber: 'TXN-2026-007',
    transactionDate: '2026-08-09',
    bankAccount: '0987654321',
    transactionType: 'تحويل',
    amount: -50000.00,
    currency: 'EUR',
    description: 'دفع فاتورة استيراد',
    beneficiaryPayer: 'European Supplies',
    relatedDocument: 'PO-2026-056',
    status: 'مرفوض',
    journalEntry: '-',
  },
  {
    transactionNumber: 'TXN-2026-008',
    transactionDate: '2026-08-08',
    bankAccount: '1234567890',
    transactionType: 'إيداع',
    amount: 89500.00,
    currency: 'SAR',
    description: 'إيداع شيك بنكي',
    beneficiaryPayer: 'مصرف الراجحي',
    relatedDocument: 'CHQ-2026-201',
    status: 'معتمد',
    journalEntry: 'JE-2026-0899',
  },
];

const statusStyle = (status) => {
  switch (status) {
    case 'معتمد':
      return 'bg-emerald-100 text-emerald-700';
    case 'قيد المراجعة':
      return 'bg-amber-100 text-amber-700';
    case 'مرفوض':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const formatAmount = (amount) => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `- ${formatted}` : formatted;
};

const BankTransactionsPanel = () => {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">معاملات البنك</h2>
        <p className="mt-1 text-sm text-gray-500">
          سجل المعاملات المالية للبنك
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-primary/90 text-white">
            <tr>
              <th className="whitespace-nowrap p-3 text-right font-semibold">رقم المعاملة</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">تاريخ</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الحساب البنكي</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">النوع</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">المبلغ</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">العملة</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الوصف</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">المستفيد / المحول</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">المستند المرتبط</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الحالة</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">القيد اليومي</th>
            </tr>
          </thead>
          <tbody>
            {STATIC_TRANSACTIONS.map((tx) => (
              <tr
                key={tx.transactionNumber}
                className="border-t border-gray-200 even:bg-gray-50/50"
              >
                <td className="whitespace-nowrap p-3 font-medium text-primary">
                  {tx.transactionNumber}
                </td>
                <td className="whitespace-nowrap p-3">{tx.transactionDate}</td>
                <td className="whitespace-nowrap p-3">{tx.bankAccount}</td>
                <td className="whitespace-nowrap p-3">{tx.transactionType}</td>
                <td className={`whitespace-nowrap p-3 font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatAmount(tx.amount)}
                </td>
                <td className="whitespace-nowrap p-3">{tx.currency}</td>
                <td className="max-w-50 truncate p-3" title={tx.description}>
                  {tx.description}
                </td>
                <td className="whitespace-nowrap p-3">{tx.beneficiaryPayer}</td>
                <td className="whitespace-nowrap p-3">{tx.relatedDocument}</td>
                <td className="whitespace-nowrap p-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="whitespace-nowrap p-3">{tx.journalEntry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default BankTransactionsPanel;
