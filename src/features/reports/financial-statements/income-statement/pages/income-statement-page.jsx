import StatementAccountsTable from '../../components/statement-accounts-table';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import { useState } from 'react';
import { Banknote, Download, ChevronDown } from 'lucide-react';
import DateInput from '../../../../../shared/ui/date-input';
import FormInput from '../../../../../shared/ui/input';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency } from '../../../../../shared/utils/formatters';
import { useFinancialPeriods } from '../../../../transactions/invoices/shared/hooks/invoices.queries';
import { useIncomeStatement } from '../hooks/income-statement.queries';
import { useIncomeStatementExport } from '../hooks/use-income-statement-export';

const secondaryTotals = [
  {
    key: 'totalCostOfSales',
    label: 'إجمالي تكلفة المبيعات',
    tone: 'border-amber-200 bg-linear-to-r from-transparent to-amber-50',
    dot: 'bg-amber-400',
  },
  {
    key: 'grossProfit',
    label: 'إجمالي الربح',
    tone: 'border-emerald-200 bg-linear-to-r from-transparent to-emerald-50',
    dot: 'bg-emerald-400',
  },
  {
    key: 'totalOperatingExpenses',
    label: 'إجمالي المصروفات التشغيلية',
    tone: 'border-orange-200 bg-orange-50/70',
    dot: 'bg-orange-400',
  },
  {
    key: 'operatingProfit',
    label: 'الربح التشغيلي',
    tone: 'border-sky-200 bg-sky-50/70',
    dot: 'bg-sky-400',
  },
  {
    key: 'totalOtherRevenue',
    label: 'إيرادات أخرى',
    tone: 'border-violet-200 bg-violet-50/70',
    dot: 'bg-violet-400',
  },
  {
    key: 'totalOtherExpenses',
    label: 'مصروفات أخرى',
    tone: 'border-rose-200 bg-rose-50/70',
    dot: 'bg-rose-400',
  },
];
const Amount = ({ value, large = false }) => (
  <span
    dir="ltr"
    className={
      'inline-block font-semibold tabular-nums ' +
      (Number(value) < 0 ? 'text-red-700 ' : 'text-primary ') +
      (large ? 'text-2xl sm:text-3xl' : '')
    }
  >
    {value == null ? '-' : formatCurrency(value)}
  </span>
);

const IncomeStatementSection = ({ section }) => {
  const accounts = section.accounts ?? [];
  const tone = {
    border: 'border-t-primary',
    surface: 'from-primary/10 to-primary/5 hover:from-primary/15',
    icon: 'border-primary/20 text-primary',
  };
  return (
    <details
      open
      className={
        'group overflow-hidden rounded-2xl border border-t-4 border-primary/20 bg-white ' +
        tone.border
      }
    >
      <summary
        className={
          'flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 bg-linear-to-l px-5 py-4 transition-colors [&::-webkit-details-marker]:hidden ' +
          tone.surface
        }
      >
        <span className="flex items-center gap-3">
          <span
            className={
              'flex h-9 w-9 items-center justify-center rounded-lg border bg-white ' +
              tone.icon
            }
          >
            <ChevronDown
              size={18}
              className="transition-transform duration-200 group-open:rotate-180"
            />
          </span>
          <span>
            <span className="block text-base font-bold text-gray-900">
              {section.sectionNameAr || section.sectionName}
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              {accounts.length} حساب
            </span>
          </span>
        </span>
        <Amount value={section.total} />
      </summary>
      <div className="border-t border-primary/10 p-3 sm:p-5">
        <StatementAccountsTable
          accounts={accounts}
          total={section.total}
          totalLabel={
            'إجمالي ' + (section.sectionNameAr || section.sectionName)
          }
        />
      </div>
    </details>
  );
};

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
      <Breadcrumb
        items={[
          { label: 'التقارير' },
          { label: 'القوائم المالية' },
          { label: 'قائمة الدخل' },
        ]}
      />
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
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

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-3">
        <DateInput
          label="من تاريخ"
          value={filters.fromDate}
          onChange={({ target: { value } }) =>
            setFilters((prev) => ({ ...prev, fromDate: value }))
          }
        />
        <DateInput
          label="إلى تاريخ"
          value={filters.toDate}
          onChange={({ target: { value } }) =>
            setFilters((prev) => ({ ...prev, toDate: value }))
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

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
          لا توجد بيانات لعرضها
        </div>
      ) : (
        <>
          <section
            aria-label="ملخص قائمة الدخل"
            className="overflow-hidden rounded-2xl border border-primary/20 bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-700">
                ملخص قائمة الدخل
              </h2>
              <span
                className={
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ' +
                  (netIncome >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700')
                }
              >
                {netIncome >= 0 ? 'صافي ربح' : 'صافي خسارة'}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-4 border-t border-gray-100 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
              {secondaryTotals.map((item, index) =>
                report[item.key] == null ? null : (
                  <div
                    key={item.key}
                    className={
                      'rounded-xl border ' +
                      (index < 2 ? 'p-6 xl:col-span-2 ' : 'p-4 ') +
                      item.tone
                    }
                  >
                    <dt className="flex items-center gap-2 text-xs text-gray-600">
                      <span
                        aria-hidden="true"
                        className={
                          'h-1.5 w-1.5 shrink-0 rounded-full ' + item.dot
                        }
                      />
                      {item.label}
                    </dt>
                    <dd className={index < 2 ? 'mt-3' : 'mt-2 text-base'}>
                      <Amount value={report[item.key]} large={index < 2} />
                    </dd>
                  </div>
                )
              )}
            </dl>
          </section>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-gray-800">
                تفاصيل الإيرادات والمصروفات
              </h2>
              <span className="text-xs text-gray-500">
                {sections.length} أقسام
              </span>
            </div>
            {sections.map((section, index) => (
              <IncomeStatementSection
                key={section.sectionName || index}
                section={section}
              />
            ))}
            </div>
        </>
      )}
    </div>
  );
};

export default IncomeStatementPage;
