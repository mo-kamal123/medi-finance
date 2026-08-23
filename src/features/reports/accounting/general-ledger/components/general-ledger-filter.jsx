import { useMemo, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import DateInput from '../../../../../shared/ui/date-input';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import AccountSearchSelect from '../../../../transactions/entries/components/account-search-select';
import useCostTree from '../../../../accounting/tree/cost-tree/hooks/use-cost-tree';
import { useFinancialPeriods, useSuppliers, useCustomers } from '../../../../transactions/invoices/hooks/invoices.queries';
import { useCurrencies } from '../../../../transactions/commercial-papers/hooks/commercial-papers.queries';
import {
  buildCostCenterOptions,
  buildPartyOptions,
} from '../../../../transactions/entries/utils/journal-entry.utils';
import {
  countActiveGeneralLedgerFilters,
  DEFAULT_GENERAL_LEDGER_FILTERS,
} from '../utils/general-ledger-filters.utils';

const GeneralLedgerFilter = ({ filters, setFilters, hiddenFields = {} }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const visibleFields = useMemo(
    () => ({
      accountId: !hiddenFields.accountId,
      fromDate: !hiddenFields.fromDate,
      toDate: !hiddenFields.toDate,
      financialPeriodId: !hiddenFields.financialPeriodId,
      costCenterId: !hiddenFields.costCenterId,
      customerId: !hiddenFields.customerId,
      supplierId: !hiddenFields.supplierId,
      currencyId: !hiddenFields.currencyId,
    }),
    [hiddenFields]
  );

  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: costTree = [] } = useCostTree();
  const { data: customers = [] } = useCustomers();
  const { data: suppliers = [] } = useSuppliers();
  const { data: currencies = [] } = useCurrencies();

  const periodOptions = useMemo(
    () =>
      financialPeriods.map((period) => ({
        value: String(period.financialPeriodID),
        label: period.nameAr || period.financialPeriodNameAr || period.nameEn,
      })),
    [financialPeriods]
  );

  const costCenterOptions = useMemo(
    () => buildCostCenterOptions(costTree),
    [costTree]
  );

  const customerOptions = useMemo(
    () =>
      buildPartyOptions(customers, {
        idKey: 'customerID',
        nameArKey: 'customerNameAr',
        nameEnKey: 'customerNameEn',
      }),
    [customers]
  );

  const supplierOptions = useMemo(
    () =>
      buildPartyOptions(suppliers, {
        idKey: 'supplierID',
        nameArKey: 'supplierNameAr',
        nameEnKey: 'supplierNameEn',
      }),
    [suppliers]
  );

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        value: String(c.currencyID),
        label: c.currencyNameAr || c.currencyNameEn || c.currencyCode,
      })),
    [currencies]
  );

  const activeFilterCount = useMemo(
    () => countActiveGeneralLedgerFilters(filters),
    [filters]
  );

  const advancedFilterCount = useMemo(
    () =>
      countActiveGeneralLedgerFilters(filters, {
        exclude: ['accountId', 'fromDate', 'toDate'],
      }),
    [filters]
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_GENERAL_LEDGER_FILTERS });
    setShowAdvanced(false);
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleFields.accountId ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">الحساب</label>
            <AccountSearchSelect
              value={filters.accountId || ''}
              onChange={(event) =>
                handleChange('accountId', event.target.value)
              }
            />
          </div>
        ) : null}

        {visibleFields.fromDate ? (
          <DateInput
            label="من تاريخ"
            value={filters.fromDate || ''}
            onChange={(event) => handleChange('fromDate', event.target.value)}
          />
        ) : null}

        {visibleFields.toDate ? (
          <DateInput
            label="إلى تاريخ"
            value={filters.toDate || ''}
            onChange={(event) => handleChange('toDate', event.target.value)}
          />
        ) : null}
                  {visibleFields.financialPeriodId ? (
            <SearchableSelect
              label="الفترة المالية"
              value={filters.financialPeriodId || ''}
              onChange={(event) =>
                handleChange('financialPeriodId', event.target.value)
              }
              placeholder="كل الفترات"
              options={periodOptions}
            />
          ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <SlidersHorizontal size={16} />
          <span>فلاتر إضافية</span>
          {advancedFilterCount > 0 ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {advancedFilterCount}
            </span>
          ) : null}
          <ChevronDown
            size={16}
            className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
        </button>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <RotateCcw size={16} />
            مسح الفلاتر
          </button>
        ) : null}
      </div>

      {showAdvanced ? (
        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleFields.costCenterId ? (
            <SearchableSelect
              label="مركز التكلفة"
              value={filters.costCenterId || ''}
              onChange={(event) =>
                handleChange('costCenterId', event.target.value)
              }
              placeholder="كل المراكز"
              options={costCenterOptions}
            />
          ) : null}

          {visibleFields.customerId ? (
            <SearchableSelect
              label="العميل"
              value={filters.customerId || ''}
              onChange={(event) =>
                handleChange('customerId', event.target.value)
              }
              placeholder="كل العملاء"
              options={customerOptions}
            />
          ) : null}

          {visibleFields.supplierId ? (
            <SearchableSelect
              label="المورد"
              value={filters.supplierId || ''}
              onChange={(event) =>
                handleChange('supplierId', event.target.value)
              }
              placeholder="كل الموردين"
              options={supplierOptions}
            />
          ) : null}
  
          {visibleFields.currencyId ? (
            <SearchableSelect
              label="العملة"
              value={filters.currencyId || ''}
              onChange={(event) =>
                handleChange('currencyId', event.target.value)
              }
              placeholder="كل العملات"
              options={currencyOptions}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default GeneralLedgerFilter;
