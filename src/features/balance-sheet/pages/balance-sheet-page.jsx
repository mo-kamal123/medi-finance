import { useMemo, useState } from 'react';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import { useFinancialPeriods } from '../../invoices/hooks/invoices.queries';
import { useBalanceSheet } from '../hooks/balance-sheet.queries';

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(value);

const groupRowsBySection = (rows = []) => {
  const sectionsMap = new Map();

  rows.forEach((row) => {
    const sectionKey = row.section || '---';
    const currentSection = sectionsMap.get(sectionKey) || {
      section: sectionKey,
      sortOrder: Number(row.sortOrder || 0),
      rows: [],
      total: 0,
    };

    currentSection.rows.push(row);
    currentSection.total += Number(row.balance) || 0;
    sectionsMap.set(sectionKey, currentSection);
  });

  return Array.from(sectionsMap.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
};

const BalanceSheetPage = () => {
  const [filters, setFilters] = useState({
    asOfDate: '',
    financialPeriodId: '',
  });

  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data = [], isLoading } = useBalanceSheet(filters);

  const sections = useMemo(() => groupRowsBySection(data), [data]);
  const totalBalance = useMemo(
    () => sections.reduce((sum, section) => sum + section.total, 0),
    [sections]
  );

  if (isLoading) {
    return (
      <PageLoader
        label={
          '\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629 \u0627\u0644\u0639\u0645\u0648\u0645\u064a\u0629...'
        }
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          {
            '\u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629 \u0627\u0644\u0639\u0645\u0648\u0645\u064a\u0629'
          }
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {
            '\u0639\u0631\u0636 \u0627\u0644\u0623\u0635\u0648\u0644 \u0648\u0627\u0644\u062e\u0635\u0648\u0645 \u0648\u062d\u0642\u0648\u0642 \u0627\u0644\u0645\u0644\u0643\u064a\u0629 \u062d\u062a\u0649 \u062a\u0627\u0631\u064a\u062e \u0645\u062d\u062f\u062f \u0623\u0648 \u062f\u0627\u062e\u0644 \u0641\u062a\u0631\u0629 \u0645\u0627\u0644\u064a\u0629'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2">
        <FormInput
          type="date"
          label={'\u062d\u062a\u0649 \u062a\u0627\u0631\u064a\u062e'}
          value={filters.asOfDate}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, asOfDate: event.target.value }))
          }
        />

        <FormInput
          as="select"
          label={
            '\u0627\u0644\u0641\u062a\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064a\u0629'
          }
          value={filters.financialPeriodId}
          onChange={(event) =>
            setFilters((prev) => ({
              ...prev,
              financialPeriodId: event.target.value,
            }))
          }
        >
          <option value="">
            {'\u0643\u0644 \u0627\u0644\u0641\u062a\u0631\u0627\u062a'}
          </option>
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

      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          {
            '\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0644\u0639\u0631\u0636\u0647\u0627'
          }
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.section}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {section.section}
                </h2>
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(section.total)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-primary/90 text-white">
                    <tr>
                      <th className="p-3 text-right">
                        {
                          '\u0643\u0648\u062f \u0627\u0644\u062d\u0633\u0627\u0628'
                        }
                      </th>
                      <th className="p-3 text-right">
                        {
                          '\u0627\u0633\u0645 \u0627\u0644\u062d\u0633\u0627\u0628'
                        }
                      </th>
                      <th className="p-3 text-right">
                        {'\u0627\u0644\u0631\u0635\u064a\u062f'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row) => (
                      <tr
                        key={`${section.section}-${row.accountID}`}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium text-gray-700">
                          {row.accountCode}
                        </td>
                        <td className="p-3 text-gray-800">{row.accountName}</td>
                        <td
                          className={`p-3 font-semibold ${
                            Number(row.balance) >= 0
                              ? 'text-emerald-700'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="2"
                        className="p-3 text-right font-bold text-gray-900"
                      >
                        {`\u0625\u062c\u0645\u0627\u0644\u064a ${section.section}`}
                      </td>
                      <td className="p-3 font-bold text-primary">
                        {formatCurrency(section.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          ))}

          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-6 py-4">
            <span className="text-lg font-bold text-gray-900">
              {
                '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0639\u0627\u0645'
              }
            </span>
            <span
              className={`text-lg font-bold ${
                totalBalance >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetPage;
