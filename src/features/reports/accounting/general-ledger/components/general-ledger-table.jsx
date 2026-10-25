import { useId, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Table from '../../../../../shared/ui/table';
import {
  formatCurrency,
  formatDate,
} from '../../../../../shared/utils/formatters';
import { groupByAccount } from '../utils/group-by-account';

const GeneralLedgerTable = ({ data, loading }) => {
  const [collapsedAccounts, setCollapsedAccounts] = useState(new Set());
  const detailsId = useId();
  const grouped = groupByAccount(data);

  const toggleAccount = (accountId) => {
    setCollapsedAccounts((previous) => {
      const next = new Set(previous);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  };

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
              balance >= 0 ? 'text-main' : 'text-red-700'
            }`}
          >
            {formatCurrency(balance)}
          </span>
        );
      },
    },
    {
      header: 'الوصف',
      key: 'descriptionAr',
      type: 'custom',
      render: (row) => (
        <span className="text-gray-800">
          {row.descriptionAr || row.descriptionEn || '-'}
        </span>
      ),
    },
    {
      header: 'مركز التكلفة',
      key: 'costCenterNameAr',
      type: 'custom',
      render: (row) =>
        [row.costCenterCode, row.costCenterNameAr]
          .filter(Boolean)
          .join(' - ') || '-',
    },
    {
      header: 'العميل / المورد',
      key: 'partyName',
      type: 'custom',
      render: (row) => row.customerNameAr || row.supplierNameAr || '-',
    },
    { header: 'رقم المرجع', key: 'referenceNumber' },
    { header: 'الفترة المالية', key: 'financialPeriodNameAr' },
    { header: 'نوع المصدر', key: 'sourceType' },
    {
      header: 'رقم القيد',
      key: 'journalEntryNumber',
      type: 'custom',
      render: (row) =>
        row.journalEntryID ? (
          <Link
            to={`/entries/${row.journalEntryID}`}
            title="عرض تفاصيل القيد"
            className="font-mono font-semibold text-primary hover:underline"
          >
            {row.journalEntryNumber || `قيد ${row.journalEntryID}`}
          </Link>
        ) : (
          <span className="font-mono text-gray-600">
            {row.journalEntryNumber || '-'}
          </span>
        ),
    },
  ];

  if (!data || data.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white [&_td]:whitespace-nowrap [&_td]:px-5 [&_td]:py-4 [&_th]:whitespace-nowrap [&_th]:px-5 [&_th]:py-4">
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
        const lastEntry = entries[entries.length - 1];
        const balance = Number(lastEntry.runningBalance) || 0;
        const isExpanded = !collapsedAccounts.has(accountId);
        const accountName =
          firstEntry.accountNameAr ||
          firstEntry.accountNameEn ||
          `حساب رقم: ${accountId}`;
        const accountDetailsId = `${detailsId}-${accountId}`;

        return (
          <section
            key={accountId}
            className="overflow-hidden rounded-2xl border border-primary/20 border-t-3 border-t-primary/90 bg-white "
          >
            <div className="flex flex-col gap-4 bg-primary/5 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleAccount(accountId)}
                  aria-expanded={isExpanded}
                  aria-controls={accountDetailsId}
                  className="flex w-full items-center justify-between gap-4 rounded-lg text-start outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                >
                  <span className="flex min-w-0 items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ChevronRight
                        aria-hidden="true"
                        size={20}
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </span>
                    <span className="min-w-0 space-y-1">
                      <span className="block text-lg font-bold text-gray-900 sm:text-xl">
                        {accountName}
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
                        <span>الحساب</span>
                        {firstEntry.accountCode ? (
                          <span
                            dir="ltr"
                            className="rounded-md border border-primary/15 bg-white px-2 py-1 font-mono text-primary"
                          >
                            {firstEntry.accountCode}
                          </span>
                        ) : null}
                        <span className="rounded-full bg-white/80 px-2.5 py-1">
                          عدد القيود: {entries.length}
                        </span>
                      </span>
                    </span>
                  </span>
                </button>
              </h2>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:shrink-0">
                <div className="rounded-lg border border-emerald-100 bg-white/90 px-3 py-2">
                  <p className="text-xs font-medium text-gray-500">
                    إجمالي مدين
                  </p>
                  <p
                    className="mt-1 text-sm font-bold text-emerald-700"
                    dir="ltr"
                  >
                    {formatCurrency(totalDebit)}
                  </p>
                </div>
                <div className="rounded-lg border border-red-100 bg-white/90 px-3 py-2">
                  <p className="text-xs font-medium text-gray-500">
                    إجمالي دائن
                  </p>
                  <p className="mt-1 text-sm font-bold text-red-700" dir="ltr">
                    {formatCurrency(totalCredit)}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-white px-3 py-2">
                  <p className="text-xs font-medium text-gray-500">الرصيد</p>
                  <p
                    dir="ltr"
                    className={`mt-1 text-sm font-bold ${
                      balance >= 0 ? 'text-main' : 'text-red-700'
                    }`}
                  >
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </div>

            <div
              id={accountDetailsId}
              hidden={!isExpanded}
              className="border-t border-primary/15 p-3 sm:p-5 [&_td]:whitespace-nowrap [&_td]:px-5 [&_td]:py-4 [&_th]:whitespace-nowrap [&_th]:px-5 [&_th]:py-4"
            >
              <Table
                columns={columns}
                data={entries}
                loading={loading}
                footer={(visibleColumns) => (
                  <tr className="border-t-2 border-gray-200">
                    {visibleColumns.map((column, index) => {
                      if (
                        column.key === 'debitAmount' ||
                        column.key === 'creditAmount'
                      ) {
                        const isDebit = column.key === 'debitAmount';
                        return (
                          <td
                            key={column.key}
                            className={`p-3 font-bold ${isDebit ? 'text-emerald-700' : 'text-red-700'}`}
                            dir="ltr"
                          >
                            {formatCurrency(isDebit ? totalDebit : totalCredit)}
                          </td>
                        );
                      }
                      return (
                        <td
                          key={column.key}
                          className="p-3 text-left font-bold text-gray-900"
                        >
                          {index === 0 ? 'الإجمالي' : null}
                        </td>
                      );
                    })}
                  </tr>
                )}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default GeneralLedgerTable;
