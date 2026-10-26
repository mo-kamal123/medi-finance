import StatementAccountsTable from '../../components/statement-accounts-table';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import { useState } from 'react';
import {
  Download,
  Scale,
  CheckCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import DateInput from '../../../../../shared/ui/date-input';
import FormInput from '../../../../../shared/ui/input';
import {
  formatCurrency,
  formatDate,
} from '../../../../../shared/utils/formatters';
import { useFinancialPeriods } from '../../../../transactions/invoices/shared/hooks/invoices.queries';
import { useBalanceSheet } from '../hooks/balance-sheet.queries';
import { useBalanceSheetExport } from '../hooks/use-balance-sheet-export';

const secondaryTotals = [
  {
    key: 'totalLiabilities',
    label: 'إجمالي الخصوم',
    tone: 'border-amber-200 bg-amber-50/70',
    dot: 'bg-amber-400',
  },
  {
    key: 'equityBeforeProfit',
    label: 'حقوق الملكية قبل الربح',
    tone: 'border-sky-200 bg-sky-50/70',
    dot: 'bg-sky-400',
  },
  {
    key: 'netIncome',
    label: 'صافي الدخل',
    tone: 'border-emerald-200 bg-emerald-50/70',
    dot: 'bg-emerald-400',
  },
  {
    key: 'totalEquity',
    label: 'إجمالي حقوق الملكية',
    tone: 'border-violet-200 bg-violet-50/70',
    dot: 'bg-violet-400',
  },
];
const primaryTotals = [
  {
    key: 'totalAssets',
    label: 'إجمالي الأصول',
    tone: 'from-teal-50 via-emerald-50/60 to-white',
    dot: 'bg-teal-500',
  },
  {
    key: 'totalLiabilitiesAndEquity',
    label: 'إجمالي الخصوم وحقوق الملكية',
    tone: 'from-violet-50 via-indigo-50/60 to-white',
    dot: 'bg-violet-500',
  },
];
const amount = (value) => (value == null ? '-' : formatCurrency(value));
const Amount = ({ value, large = false }) => (
  <span
    dir="ltr"
    className={
      'inline-block font-semibold tabular-nums ' +
      (Number(value) < 0 ? 'text-red-700 ' : 'text-primary ') +
      (large ? 'text-2xl sm:text-3xl' : '')
    }
  >
    {amount(value)}
  </span>
);

const BalanceSheetSection = ({ section }) => {
  const tone = {
    border: 'border-t-primary',
    surface: 'from-primary/10 to-primary/5 hover:from-primary/15',
    icon: 'border-primary/20 text-primary',
  };
  const subSections = section.subSections ?? [];
  const count = subSections.reduce(
    (sum, sub) => sum + (sub.accounts?.length ?? 0),
    0
  );
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
              {count} حساب · {subSections.length} مجموعة
            </span>
          </span>
        </span>
        <Amount value={section.total} />
      </summary>
      <div className="space-y-5 border-t border-primary/10 p-3 sm:p-5">
        {subSections.length ? (
          subSections.map((sub, index) => (
            <div key={sub.subSectionName || index} className="space-y-3">
              {(subSections.length > 1 ||
                (sub.subSectionNameAr || sub.subSectionName)?.trim() !==
                  (section.sectionNameAr || section.sectionName)?.trim()) && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-primary/5 px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {sub.subSectionNameAr || sub.subSectionName}
                  </h3>
                  <Amount value={sub.total} />
                </div>
              )}
              <StatementAccountsTable
                accounts={sub.accounts ?? []}
                total={sub.total}
                totalLabel={
                  'إجمالي ' + (sub.subSectionNameAr || sub.subSectionName)
                }
                showMetadata
              />
            </div>
          ))
        ) : (
          <StatementAccountsTable
            accounts={[]}
            total={section.total}
            totalLabel={
              'إجمالي ' + (section.sectionNameAr || section.sectionName)
            }
            showMetadata
          />
        )}
      </div>
    </details>
  );
};

const BalanceSheetPage = () => {
  const [filters, setFilters] = useState({
    asOfDate: '',
    financialPeriodId: '',
    accountLevel: '',
  });
  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: report, isLoading, isError } = useBalanceSheet(filters);
  const { handleExport, isExporting } = useBalanceSheetExport();
  const sections = report?.sections ?? [];
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: 'التقارير' },
          { label: 'القوائم المالية' },
          { label: 'الميزانية العمومية' },
        ]}
      />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Scale size={23} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                الميزانية العمومية
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                الأصول والخصوم وحقوق الملكية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleExport(filters)}
            disabled={!report || isExporting || isLoading || isError}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 bg-gray-50/60 p-5 sm:grid-cols-3 sm:p-6">
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
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                financialPeriodId: event.target.value,
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
          <FormInput
            as="select"
            label="مستوى الحساب"
            value={filters.accountLevel}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                accountLevel: event.target.value
                  ? Number(event.target.value)
                  : '',
              }))
            }
          >
            <option value="">كل المستويات</option>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={level} value={level}>
                المستوى {level}
              </option>
            ))}
          </FormInput>
        </div>
      </div>
      {isLoading ? (
        <div
          role="status"
          className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500"
        >
          جاري تحميل الميزانية العمومية...
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700"
        >
          تعذر تحميل الميزانية العمومية
        </div>
      ) : (
        <>
          {report && (
            <section
              aria-label="ملخص الميزانية العمومية"
              className="overflow-hidden rounded-2xl border border-primary/20 bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    حتى تاريخ: {formatDate(report.asOfDate)}
                  </span>
                  {typeof report.isCostCenterFiltered === 'boolean' && (
                    <span>
                      {report.isCostCenterFiltered
                        ? 'مصفى حسب مركز التكلفة'
                        : 'جميع مراكز التكلفة'}
                    </span>
                  )}
                </div>
                {typeof report.isBalanced === 'boolean' && (
                  <span
                    className={
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ' +
                      (report.isBalanced
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700')
                    }
                  >
                    {report.isBalanced ? (
                      <CheckCircle size={15} />
                    ) : (
                      <XCircle size={15} />
                    )}
                    {report.isBalanced ? 'متوازن' : 'غير متوازن'}
                  </span>
                )}
              </div>
              <div className="grid divide-y divide-gray-100 md:grid-cols-2 md:divide-y-0 md:divide-x md:divide-x-reverse">
                {primaryTotals.map((item) => (
                  <div
                    key={item.key}
                    className={'bg-linear-to-l p-5 sm:p-6 ' + item.tone}
                  >
                    <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <span
                        aria-hidden="true"
                        className={'h-2 w-2 rounded-full ' + item.dot}
                      />
                      {item.label}
                    </p>
                    <p className="mt-2 break-words">
                      <Amount value={report[item.key]} large />
                    </p>
                  </div>
                ))}
              </div>
              <dl className="grid grid-cols-1 gap-5 border-t border-gray-100 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
                {secondaryTotals.map((item) => (
                  <div
                    key={item.key}
                    className={'rounded-xl border p-4 ' + item.tone}
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
                    <dd className="mt-2 text-base">
                      <Amount value={report[item.key]} />
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-3 text-sm">
                <span className="text-gray-500">
                  الفرق بين الأصول والخصوم وحقوق الملكية
                </span>
                <span
                  dir="ltr"
                  className={
                    'font-semibold tabular-nums ' +
                    (Number(report.difference) === 0
                      ? 'text-primary'
                      : 'text-red-700')
                  }
                >
                  {amount(report.difference)}
                </span>
              </div>
            </section>
          )}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-gray-800">
                تفاصيل الحسابات
              </h2>
              <span className="text-xs text-gray-500">
                {sections.length} أقسام
              </span>
            </div>
            {sections.length ? (
              sections.map((section, index) => (
                <BalanceSheetSection
                  key={section.sectionName || index}
                  section={section}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                لا توجد بيانات لعرضها
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default BalanceSheetPage;
