import { useState } from 'react';
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Download,
} from 'lucide-react';
import DateInput from '../../../shared/ui/date-input';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useFinancialPeriods } from '../../invoices/hooks/invoices.queries';
import { useIncomeStatement } from '../hooks/income-statement.queries';
import { useIncomeStatementExport } from '../hooks/use-income-statement-export';

const summaryCards = [
  { key: 'totalRevenue', label: 'إجمالي الإيرادات', icon: TrendingUp, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700', bar: 'bg-emerald-500' },
  { key: 'totalCostOfSales', label: 'إجمالي تكلفة المبيعات', icon: Receipt, iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700', bar: 'bg-red-500' },
  { key: 'grossProfit', label: 'إجمالي الربح', icon: PiggyBank, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700', bar: 'bg-emerald-500' },
  { key: 'totalOperatingExpenses', label: 'إجمالي المصروفات التشغيلية', icon: Receipt, iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700', bar: 'bg-red-500' },
  { key: 'operatingProfit', label: 'الربح التشغيلي', icon: DollarSign, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700', bar: 'bg-blue-500' },
  { key: 'totalOtherRevenue', label: 'إيرادات أخرى', icon: ArrowUpCircle, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700', bar: 'bg-emerald-500' },
  { key: 'totalOtherExpenses', label: 'مصروفات أخرى', icon: ArrowDownCircle, iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700', bar: 'bg-red-500' },
];

const IncomeStatementPage = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    financialPeriodId: '',
  });

  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: report, isLoading } = useIncomeStatement(filters);
  const { handleExport, isExporting } = useIncomeStatementExport();

  if (isLoading) {
    return <PageLoader label="جاري تحميل قائمة الدخل..." />;
  }

  const sections = report?.sections || [];
  const netIncome = report?.netIncome ?? 0;
  const hasData = sections.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Banknote size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">قائمة الدخل</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض الإيرادات والمصروفات وصافي الربح خلال الفترة
            </p>
          </div>
        </div>
        {hasData ? (
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

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-3">
        <DateInput
          label="من تاريخ"
          value={filters.fromDate}
          onChange={({ target: { value } }) => setFilters((prev) => ({ ...prev, fromDate: value }))}
        />
        <DateInput
          label="إلى تاريخ"
          value={filters.toDate}
          onChange={({ target: { value } }) => setFilters((prev) => ({ ...prev, toDate: value }))}
        />
        <FormInput
          as="select"
          label="الفترة المالية"
          value={filters.financialPeriodId}
          onChange={(e) => setFilters((prev) => ({ ...prev, financialPeriodId: e.target.value }))}
        >
          <option value="">كل الفترات</option>
          {financialPeriods.map((period) => (
            <option key={period.financialPeriodID} value={period.financialPeriodID}>
              {period.nameAr || period.financialPeriodNameAr || period.nameEn}
            </option>
          ))}
        </FormInput>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          لا توجد بيانات لعرضها
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

  <div className="flex items-center gap-4">
    {/* Icon */}
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}
    >
      <Icon size={22} />
    </div>

    {/* Text */}
    <div className="flex flex-col">
      <p className="text-sm font-medium text-gray-500">
        {card.label}
      </p>

      <p className={`text-2xl font-bold ${card.valueColor}`}>
        {formatCurrency(value)}
      </p>
    </div>
  </div>
</div>
              );
            })}
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.sectionName}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="bg-white border-b border-gray-200 px-6 py-4">
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
                        <th className="px-4 py-3 text-right font-semibold">كود الحساب</th>
                        <th className="px-4 py-3 text-right font-semibold">اسم الحساب</th>
                        <th className="px-4 py-3 text-right font-semibold">الرصيد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(section.accounts || []).map((acc) => (
                        <tr
                          key={`${section.sectionName}-${acc.accountCode}`}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-sm text-gray-500">{acc.accountCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{acc.accountNameAr}</td>
                          <td
                            className={`px-4 py-3 text-sm font-semibold ${
                              Number(acc.balance) >= 0 ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(acc.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-l from-primary/10 to-primary/5 border-t-2 border-primary/20">
                        <td colSpan="2" className="px-4 py-3.5 text-right font-bold text-gray-900">
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

          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-l from-primary/10 via-primary/5 to-white px-6 py-5 shadow-sm">
            <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Banknote size={20} />
                </div>
                <span className="text-base font-bold text-gray-900">صافي الدخل</span>
              </div>
              <span
                className={`text-lg font-bold ${
                  netIncome >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatCurrency(netIncome)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeStatementPage;