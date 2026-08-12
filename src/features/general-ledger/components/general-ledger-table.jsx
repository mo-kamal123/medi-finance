import { ChevronDown } from 'lucide-react';
import Table from '../../../shared/ui/table';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { groupByAccount } from '../utils/group-by-account';

const GeneralLedgerTable = ({ data, loading }) => {
  const grouped = groupByAccount(data);

  const columns = [
    {
      header: 'التاريخ',
      key: 'entryDate',
      type: 'custom',
      render: (row) => (
        <span className="text-gray-700">{formatDate(row.entryDate)}</span>
      ),
    },
    {
      header: 'رقم القيد',
      key: 'journalEntryNumber',
      type: 'custom',
      render: (row) => (
        <span className="font-mono text-gray-600">{row.journalEntryNumber}</span>
      ),
    },
    {
      header: 'الوصف',
      key: 'descriptionAr',
      type: 'custom',
      render: (row) => (
        <span className="text-gray-800">{row.descriptionAr || row.descriptionEn || '-'}</span>
      ),
    },
    {
      header: 'مدين',
      key: 'debitAmount',
      type: 'custom',
      render: (row) => (
        <span className="font-semibold text-emerald-700" dir="ltr">
          {formatCurrency(row.debitAmount)}
        </span>
      ),
    },
    {
      header: 'دائن',
      key: 'creditAmount',
      type: 'custom',
      render: (row) => (
        <span className="font-semibold text-red-700" dir="ltr">
          {formatCurrency(row.creditAmount)}
        </span>
      ),
    },
    {
      header: 'الرصيد',
      key: 'runningBalance',
      type: 'custom',
      render: (row) => {
        const balance = Number(row.runningBalance) || 0;
        return (
          <span
            dir="ltr"
            className={`font-bold ${
              balance >= 0 ? 'text-blue-700' : 'text-red-700'
            }`}
          >
            {formatCurrency(balance)}
          </span>
        );
      },
    },
  ];

  if (!data || data.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <Table columns={columns} data={[]} loading={loading} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([accountId, entries]) => {
        const totalDebit = entries.reduce(
          (sum, item) => sum + (Number(item.debitAmount) || 0),
          0
        );

        const totalCredit = entries.reduce(
          (sum, item) => sum + (Number(item.creditAmount) || 0),
          0
        );

        const firstEntry = entries[0];
        const balance = Number(firstEntry.runningBalance) || 0;

        return (
          <div key={accountId} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <ChevronDown size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {firstEntry.accountCode
                        ? `${firstEntry.accountCode} - `
                        : ''}
                      {firstEntry.accountNameAr ||
                        firstEntry.accountNameEn ||
                        `حساب رقم: ${accountId}`}
                    </h2>
                    <p className="text-sm text-gray-500">
                      عدد القيود: {entries.length}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <div className="text-left">
                    <p className="text-xs text-gray-500">إجمالي مدين</p>
                    <p className="text-sm font-bold text-emerald-700" dir="ltr">
                      {formatCurrency(totalDebit)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">إجمالي دائن</p>
                    <p className="text-sm font-bold text-red-700" dir="ltr">
                      {formatCurrency(totalCredit)}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">الرصيد</p>
                    <p
                      dir="ltr"
                      className={`text-sm font-bold ${
                        balance >= 0 ? 'text-blue-700' : 'text-red-700'
                      }`}
                    >
                      {formatCurrency(balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={entries}
              loading={loading}
              footer={
                <tr className="border-t-2 border-gray-200">
                  <td
                    colSpan={3}
                    className="p-3 text-left font-bold text-gray-900"
                  >
                    الإجمالي
                  </td>
                  <td className="p-3 font-bold text-emerald-700" dir="ltr">
                    {formatCurrency(totalDebit)}
                  </td>
                  <td className="p-3 font-bold text-red-700" dir="ltr">
                    {formatCurrency(totalCredit)}
                  </td>
                  <td className="p-3" />
                </tr>
              }
            />
          </div>
        );
      })}
    </div>
  );
};

export default GeneralLedgerTable;