import Table from '../../../shared/ui/table';
import { groupByAccount } from '../utils/group-by-account';

const GeneralLedgerTable = ({ data }) => {
  const grouped = groupByAccount(data);

  const columns = [
    {
      header: 'التاريخ',
      key: 'EntryDate',
    },
    {
      header: 'رقم القيد',
      key: 'JournalEntryNumber',
    },
    {
      header: 'مدين',
      key: 'DebitAmount',
      type: 'custom',
      render: (row) => (
        <span className="text-green-600 font-medium">
          {row.DebitAmount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'دائن',
      key: 'CreditAmount',
      type: 'custom',
      render: (row) => (
        <span className="text-red-600 font-medium">
          {row.CreditAmount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'الرصيد الجاري',
      key: 'RunningBalance',
      type: 'custom',
      render: (row) => (
        <span
          className={
            row.RunningBalance >= 0
              ? 'text-blue-600 font-semibold'
              : 'text-red-600 font-semibold'
          }
        >
          {row.RunningBalance?.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([accountId, entries]) => {
        const totalDebit = entries.reduce(
          (sum, item) => sum + item.DebitAmount,
          0
        );

        const totalCredit = entries.reduce(
          (sum, item) => sum + item.CreditAmount,
          0
        );

        return (
          <div key={accountId}>
            <h2 className="text-lg font-bold mb-3">حساب رقم: {accountId}</h2>

            <Table
              columns={columns}
              data={entries}
              footer={
                <tr>
                  <td
                    colSpan={2}
                    className="p-3 border border-gray-300 text-left"
                  >
                    الإجمالي
                  </td>
                  <td className="p-3 border border-gray-300 text-green-600">
                    {totalDebit.toLocaleString()}
                  </td>
                  <td className="p-3 border border-gray-300 text-red-600">
                    {totalCredit.toLocaleString()}
                  </td>
                  <td className="p-3 border border-gray-300"></td>
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
