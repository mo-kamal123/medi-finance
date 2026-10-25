import Table from '../../../../shared/ui/table';
import { formatCurrency } from '../../../../shared/utils/formatters';

const accountTypes = {
  Asset: 'أصول',
  Liability: 'خصوم',
  Equity: 'حقوق الملكية',
  Revenue: 'إيرادات',
  Expense: 'مصروفات',
};

const Balance = ({ value }) => (
  <span
    dir="ltr"
    className={
      'inline-block whitespace-nowrap font-semibold tabular-nums ' +
      (Number(value) < 0 ? 'text-red-700' : 'text-primary')
    }
  >
    {value == null ? '-' : formatCurrency(value)}
  </span>
);

const StatementAccountsTable = ({
  accounts = [],
  total,
  totalLabel,
  showMetadata = false,
}) => {
  const columns = [
    {
      header: 'كود الحساب',
      key: 'accountCode',
      type: 'custom',
      render: (account) => (
        <div className="whitespace-nowrap">
          <span
            dir="ltr"
            className="inline-block font-mono font-medium text-gray-700"
          >
            {account.accountCode || '-'}
          </span>
          {showMetadata && (
            <span className="mt-1 block text-xs text-gray-400">
              المعرف: {account.accountID ?? '-'}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'اسم الحساب',
      key: 'accountNameAr',
      type: 'custom',
      render: (account) => (
        <div className="min-w-56 text-start">
          <span className="block font-medium text-gray-900">
            {account.accountNameAr || account.accountNameEn || '-'}
          </span>
          {account.accountNameEn && (
            <span
              dir="ltr"
              className="mt-1 block text-start text-xs text-gray-500"
            >
              {account.accountNameEn}
            </span>
          )}
        </div>
      ),
    },
    ...(showMetadata
      ? [
          {
            header: 'نوع الحساب',
            key: 'accountType',
            type: 'custom',
            render: (account) => (
              <span className="whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {accountTypes[account.accountType] ||
                  account.accountType ||
                  '-'}
              </span>
            ),
          },
          { header: 'الحساب الرئيسي', key: 'parentAccountID' },
        ]
      : []),
    {
      header: 'الرصيد',
      key: 'balance',
      type: 'custom',
      render: (account) => <Balance value={account.balance} />,
    },
  ];

  return (
    <Table
      showColumnPicker={false}
      columns={columns}
      data={accounts}
      emptyMessage="لا توجد حسابات"
      footer={(visibleColumns) => (
        <tr className="border-t-2 border-primary/15 bg-primary/5">
          {visibleColumns.map((column, index) => (
            <td key={column.key} className="p-3 font-bold text-gray-800">
              {column.key === 'balance' ? (
                <Balance value={total} />
              ) : index === 0 ? (
                totalLabel
              ) : null}
            </td>
          ))}
        </tr>
      )}
    />
  );
};

export default StatementAccountsTable;
