import { Fragment, useState } from 'react';
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
const sectionTones = {
  assets: {
    border: 'border-t-teal-400',
    surface: 'from-teal-50 to-emerald-50/40 hover:from-teal-100/70',
    icon: 'border-teal-200 text-teal-700',
  },
  liabilities: {
    border: 'border-t-amber-400',
    surface: 'from-amber-50 to-orange-50/40 hover:from-amber-100/70',
    icon: 'border-amber-200 text-amber-700',
  },
  equity: {
    border: 'border-t-violet-400',
    surface: 'from-violet-50 to-indigo-50/40 hover:from-violet-100/70',
    icon: 'border-violet-200 text-violet-700',
  },
};
const accountTypes = {
  Asset: 'أصول',
  Liability: 'خصوم',
  Equity: 'حقوق الملكية',
  Revenue: 'إيرادات',
  Expense: 'مصروفات',
};
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
  const sectionName = (section.sectionName || '').toLowerCase();
  const type = section.subSections?.[0]?.accounts?.[0]?.accountType;
  const tone =
    sectionName.includes('liabil') || type === 'Liability'
      ? sectionTones.liabilities
      : sectionName.includes('equity') || type === 'Equity'
        ? sectionTones.equity
        : sectionTones.assets;
  const subSections = section.subSections ?? [];
  const count = subSections.reduce(
    (sum, sub) => sum + (sub.accounts?.length ?? 0),
    0
  );
  return (
    <details
      open
      className={
        'group overflow-hidden rounded-2xl border border-t-4 border-gray-200 bg-white ' +
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
      <div className="overflow-x-auto border-t border-gray-100">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <tr>
              {[
                'كود الحساب',
                'اسم الحساب',
                'نوع الحساب',
                'الحساب الرئيسي',
                'الرصيد',
              ].map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="whitespace-nowrap px-5 py-3 text-start font-medium"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!subSections.length && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                  لا توجد حسابات
                </td>
              </tr>
            )}
            {subSections.map((sub, subIndex) => (
              <Fragment key={subIndex}>
                <tr className="border-y border-gray-100 bg-gray-50/80">
                  <th
                    scope="rowgroup"
                    colSpan={4}
                    className="px-5 py-3 text-start font-semibold text-gray-700"
                  >
                    {sub.subSectionNameAr || sub.subSectionName}
                  </th>
                  <td className="whitespace-nowrap px-5 py-3">
                    <Amount value={sub.total} />
                  </td>
                </tr>
                {(sub.accounts ?? []).map((account, index) => (
                  <tr
                    key={account.accountID ?? index}
                    className="border-b border-gray-100 transition-colors hover:bg-primary/5"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        dir="ltr"
                        className="inline-block font-mono font-medium text-gray-700"
                      >
                        {account.accountCode || '-'}
                      </span>
                      <span className="mt-1 block text-xs text-gray-400">
                        المعرف: {account.accountID ?? '-'}
                      </span>
                    </td>
                    <td className="min-w-56 px-5 py-4">
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
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {accountTypes[account.accountType] ||
                          account.accountType ||
                          '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-500">
                      {account.parentAccountID ?? '-'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <Amount value={account.balance} />
                    </td>
                  </tr>
                ))}
                {!sub.accounts?.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-6 text-center text-gray-400"
                    >
                      لا توجد حسابات
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-primary/15 bg-primary/5">
            <tr>
              <th
                scope="row"
                colSpan={4}
                className="px-5 py-4 text-start font-bold text-gray-800"
              >
                إجمالي {section.sectionNameAr || section.sectionName}
              </th>
              <td className="whitespace-nowrap px-5 py-4">
                <Amount value={section.total} />
              </td>
            </tr>
          </tfoot>
        </table>
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
