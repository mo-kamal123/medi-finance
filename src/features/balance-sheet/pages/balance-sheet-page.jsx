import { useMemo, useState } from 'react';
import { Download, Scale, CheckCircle, XCircle } from 'lucide-react';
import DateInput from '../../../shared/ui/date-input';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useFinancialPeriods } from '../../invoices/hooks/invoices.queries';
import { useBalanceSheet } from '../hooks/balance-sheet.queries';
import { useBalanceSheetExport } from '../hooks/use-balance-sheet-export';

const summaryCards = [
  {
    key: 'totalAssets',
    label: 'إجمالي الأصول',
    icon: Scale,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
    bar: 'bg-emerald-500',
  },
  {
    key: 'totalLiabilitiesAndEquity',
    label: 'إجمالي الخصوم وحقوق الملكية',
    icon: Scale,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
    bar: 'bg-blue-500',
  },
  // {
  //   key: 'netIncome',
  //   label: 'صافي الدخل',
  //   icon: Scale,
  //   iconBg: 'bg-amber-100',
  //   iconColor: 'text-amber-600',
  //   valueColor: 'text-amber-700',
  //   bar: 'bg-amber-500',
  // },
  // {
  //   key: 'difference',
  //   label: 'الفرق',
  //   icon: Scale,
  //   iconBg: 'bg-purple-100',
  //   iconColor: 'text-purple-600',
  //   valueColor: 'text-purple-700',
  //   bar: 'bg-purple-500',
  // },
];

const BalanceSheetPage = () => {
  const [filters, setFilters] = useState({
    asOfDate: '',
    financialPeriodId: '',
  });

  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: report, isLoading } = useBalanceSheet(filters);
  const { handleExport, isExporting } = useBalanceSheetExport();
  const sections = report?.sections ?? [];

  const flatRows = useMemo(() => {
    return sections.flatMap((section) =>
      (section.subSections || []).flatMap((sub) => [
        { type: 'subHeader', section, sub },
        ...(sub.accounts?.length
          ? sub.accounts.map((acc) => ({ type: 'account', section, sub, acc }))
          : [{ type: 'empty', section, sub }]),
      ])
    );
  }, [sections]);

  if (isLoading) return <PageLoader label="جاري تحميل الميزانية العمومية..." />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              الميزانية العمومية
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض الأصول والخصوم وحقوق الملكية حتى تاريخ محدد أو داخل فترة مالية
            </p>
          </div>
        </div>
        {report ? (
          <button
            type="button"
            onClick={() => handleExport(filters)}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Download size={16} />
            {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2">
        <DateInput
          label="حتى تاريخ"
          value={filters.asOfDate}
          onChange={({ target: { value } }) =>
            setFilters((prev) => ({ ...prev, asOfDate: value }))
          }
        />
        <FormInput
          as="select"
          label="الفترة المالية"
          value={filters.financialPeriodId}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              financialPeriodId: e.target.value,
            }))
          }
        >
          <option value="">كل الفترات</option>
          {financialPeriods.map((period) => (
            <option
              key={period.financialPeriodID}
              value={period.financialPeriodID}
            >
              {period.nameAr || period.financialPeriodNameAr || period.nameEn}
            </option>
          ))}
        </FormInput>
      </div>

      {report && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {summaryCards.map((card) => {
            const value = report[card.key];
            if (value == null) return null;
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {/* Right color bar */}
                <div
                  className={`absolute right-0 top-0 h-full w-1 ${card.bar}`}
                />

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}
                  >
                    <Icon size={22} />
                  </div>

                  {card.key === 'difference' && (
                    <div
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        report.isBalanced
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {report.isBalanced ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      <span>{report.isBalanced ? 'متوازن' : 'غير متوازن'}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>

                  <p className={`mt-1 text-2xl font-bold ${card.valueColor}`}>
                    {formatCurrency(value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          لا توجد بيانات لعرضها
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.sectionName}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="bg-gradient-to-l from-primary/5 via-primary/[0.02] to-transparent border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">
                    {section.sectionNameAr || section.sectionName}
                  </h2>
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(section.total)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary to-primary/90 text-white">
                      <th className="px-4 py-3 text-right font-semibold">
                        كود الحساب
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        اسم الحساب
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        الرصيد
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatRows.map((row, idx) => {
                      if (row.type === 'subHeader') {
                        return (
                          <tr
                            key={`h-${row.section.sectionName}-${row.sub.subSectionName}-${idx}`}
                          >
                            <td
                              colSpan="3"
                              className="bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700"
                            >
                              {row.sub.subSectionNameAr ||
                                row.sub.subSectionName}
                              <span className="mr-2 text-xs text-gray-400 font-normal">
                                ({formatCurrency(row.sub.total)})
                              </span>
                            </td>
                          </tr>
                        );
                      }
                      if (row.type === 'empty') {
                        return (
                          <tr
                            key={`e-${row.section.sectionName}-${row.sub.subSectionName}-${idx}`}
                          >
                            <td
                              colSpan="3"
                              className="px-4 py-5 text-center text-sm text-gray-500"
                            >
                              لا توجد حسابات
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr
                          key={`r-${row.section.sectionName}-${row.sub.subSectionName}-${row.acc.accountID}-${idx}`}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-sm text-gray-500">
                            {row.acc.accountCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {row.acc.accountNameAr || row.acc.accountNameEn}
                          </td>
                          <td
                            className={`px-4 py-3 text-sm font-semibold ${
                              Number(row.acc.balance) >= 0
                                ? 'text-emerald-700'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(row.acc.balance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-l from-primary/10 to-primary/5 border-t-2 border-primary/20">
                      <td
                        colSpan="2"
                        className="px-4 py-3.5 text-right font-bold text-gray-900"
                      >
                        إجمالي {section.sectionNameAr || section.sectionName}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-primary">
                        {formatCurrency(section.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default BalanceSheetPage;