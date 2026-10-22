import { useMemo } from 'react';
import FilterBar from '../../../../../shared/ui/filter-bar';
import DateInput from '../../../../../shared/ui/date-input';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import AccountSearchSelect from '../../../../transactions/entries/components/account-search-select';
import useCostTree from '../../../../accounting/tree/cost-tree/hooks/use-cost-tree';
import {
  useFinancialPeriods,
  useSuppliers,
  useCustomers,
} from '../../../../transactions/invoices/shared/hooks/invoices.queries';
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
        exclude: ['accountId', 'fromDate', 'toDate', 'financialPeriodId'],
      }),
    [filters]
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_GENERAL_LEDGER_FILTERS });
  };

  const primaryFilters = [
    visibleFields.accountId && (
      <div key="accountId">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          الحساب
        </label>
        <AccountSearchSelect
          value={filters.accountId || ''}
          onChange={(event) => handleChange('accountId', event.target.value)}
        />
      </div>
    ),
    visibleFields.fromDate && (
      <DateInput
        key="fromDate"
        label="من تاريخ"
        value={filters.fromDate || ''}
        onChange={(event) => handleChange('fromDate', event.target.value)}
      />
    ),
    visibleFields.toDate && (
      <DateInput
        key="toDate"
        label="إلى تاريخ"
        value={filters.toDate || ''}
        onChange={(event) => handleChange('toDate', event.target.value)}
      />
    ),
    visibleFields.financialPeriodId && (
      <SearchableSelect
        key="financialPeriodId"
        label="الفترة المالية"
        value={filters.financialPeriodId || ''}
        onChange={(event) =>
          handleChange('financialPeriodId', event.target.value)
        }
        placeholder="كل الفترات"
        options={periodOptions}
      />
    ),
  ].filter(Boolean);

  const extraFilters = [
    visibleFields.costCenterId && (
      <SearchableSelect
        key="costCenterId"
        label="مركز التكلفة"
        value={filters.costCenterId || ''}
        onChange={(event) => handleChange('costCenterId', event.target.value)}
        placeholder="كل المراكز"
        options={costCenterOptions}
      />
    ),
    visibleFields.customerId && (
      <SearchableSelect
        key="customerId"
        label="العميل"
        value={filters.customerId || ''}
        onChange={(event) => handleChange('customerId', event.target.value)}
        placeholder="كل العملاء"
        options={customerOptions}
      />
    ),
    visibleFields.supplierId && (
      <SearchableSelect
        key="supplierId"
        label="المورد"
        value={filters.supplierId || ''}
        onChange={(event) => handleChange('supplierId', event.target.value)}
        placeholder="كل الموردين"
        options={supplierOptions}
      />
    ),
    visibleFields.currencyId && (
      <SearchableSelect
        key="currencyId"
        label="العملة"
        value={filters.currencyId || ''}
        onChange={(event) => handleChange('currencyId', event.target.value)}
        placeholder="كل العملات"
        options={currencyOptions}
      />
    ),
  ].filter(Boolean);

  return (
    <FilterBar
      primaryFilters={primaryFilters}
      extraFilters={extraFilters}
      onReset={handleReset}
      activeCount={activeFilterCount}
      extraCount={advancedFilterCount}
    />
  );
};

export default GeneralLedgerFilter;
