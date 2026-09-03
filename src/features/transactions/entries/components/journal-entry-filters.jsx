import { useEffect, useMemo, useRef, useState } from 'react';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import FilterBar from '../../../../shared/ui/filter-bar';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import { useFinancialPeriods } from '../../invoices/hooks/invoices.queries';
import useAccountsTree from '../../../accounting/tree/accouts-tree/hooks/use-accounts-tree';
import { useJournalEntryStatuses } from '../hooks/entries.queries';
import {
  countActiveJournalEntryFilters,
  DEFAULT_JOURNAL_ENTRY_FILTERS,
} from '../utils/journal-entry-filters.utils';
import {
  buildAccountOptions,
  JOURNAL_TYPES,
} from '../utils/journal-entry.utils';

const FILTER_FIELDS = {
  journalEntryNumber: true,
  referenceNumber: true,
  journalType: true,
  status: true,
  fromDate: true,
  toDate: true,
  financialPeriodId: true,
  accountId: true,
};

const JournalEntryFilters = ({
  filters,
  setFilters,
  hiddenFields = {},
  className = '',
}) => {
  const [localEntryNumber, setLocalEntryNumber] = useState(
    filters.journalEntryNumber || ''
  );
  const [localRefNumber, setLocalRefNumber] = useState(
    filters.referenceNumber || ''
  );
  const debouncedEntryNumber = useDebounce(localEntryNumber, 500);
  const debouncedRefNumber = useDebounce(localRefNumber, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setFilters((prev) => ({
      ...prev,
      journalEntryNumber: debouncedEntryNumber,
      pageNumber: 1,
    }));
  }, [debouncedEntryNumber]);

  useEffect(() => {
    if (isFirstRender.current) return;
    setFilters((prev) => ({
      ...prev,
      referenceNumber: debouncedRefNumber,
      pageNumber: 1,
    }));
  }, [debouncedRefNumber]);

  useEffect(() => {
    setLocalEntryNumber(filters.journalEntryNumber || '');
    setLocalRefNumber(filters.referenceNumber || '');
  }, [filters.journalEntryNumber, filters.referenceNumber]);

  const { data: statuses = [] } = useJournalEntryStatuses();
  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: accountsTree = [] } = useAccountsTree();

  const visibleFields = useMemo(
    () => ({
      ...FILTER_FIELDS,
      ...hiddenFields,
    }),
    [hiddenFields]
  );

  const statusOptions = useMemo(
    () =>
      statuses.map((status) => ({
        value: status.name || String(status.id),
        label: status.name,
      })),
    [statuses]
  );

  const journalTypeOptions = useMemo(
    () =>
      JOURNAL_TYPES.map((type) => ({
        value: type.value,
        label: type.label,
      })),
    []
  );

  const periodOptions = useMemo(
    () =>
      financialPeriods.map((period) => ({
        value: String(period.financialPeriodID),
        label: period.nameAr || period.financialPeriodNameAr || period.nameEn,
      })),
    [financialPeriods]
  );

  const accountOptions = useMemo(
    () => buildAccountOptions(accountsTree),
    [accountsTree]
  );

  const activeFilterCount = useMemo(
    () => countActiveJournalEntryFilters(filters),
    [filters]
  );

  const advancedFilterCount = useMemo(
    () =>
      countActiveJournalEntryFilters(filters, {
        exclude: [
          'pageNumber',
          'pageSize',
          'journalEntryNumber',
          'referenceNumber',
          'journalType',
          'status',
        ],
      }),
    [filters]
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: 1,
    }));
  };

  const handleReset = () => {
    setFilters((prev) => ({
      ...DEFAULT_JOURNAL_ENTRY_FILTERS,
      pageSize: prev.pageSize,
    }));
  };

  const primaryFilters = [];

  if (visibleFields.journalEntryNumber) {
    primaryFilters.push(
      <FormInput
        key="entryNumber"
        label="رقم القيد"
        value={localEntryNumber}
        onChange={(event) => setLocalEntryNumber(event.target.value)}
        placeholder="ابحث برقم القيد"
        autoFocus
      />
    );
  }

  if (visibleFields.referenceNumber) {
    primaryFilters.push(
      <FormInput
        key="refNumber"
        label="رقم المرجع"
        value={localRefNumber}
        onChange={(event) => setLocalRefNumber(event.target.value)}
        placeholder="رقم المرجع"
      />
    );
  }

  if (visibleFields.journalType) {
    primaryFilters.push(
      <SearchableSelect
        key="type"
        label="نوع القيد"
        value={filters.journalType || ''}
        onChange={(event) => handleChange('journalType', event.target.value)}
        placeholder="كل الأنواع"
        options={journalTypeOptions}
      />
    );
  }

  if (visibleFields.status) {
    primaryFilters.push(
      <SearchableSelect
        key="status"
        label="الحالة"
        value={filters.status || ''}
        onChange={(event) => handleChange('status', event.target.value)}
        placeholder="كل الحالات"
        options={statusOptions}
      />
    );
  }

  const extraFilters = [];

  if (visibleFields.fromDate) {
    extraFilters.push(
      <DateInput
        key="from"
        label="من تاريخ"
        value={filters.fromDate || ''}
        onChange={(event) => handleChange('fromDate', event.target.value)}
      />
    );
  }

  if (visibleFields.toDate) {
    extraFilters.push(
      <DateInput
        key="to"
        label="إلى تاريخ"
        value={filters.toDate || ''}
        onChange={(event) => handleChange('toDate', event.target.value)}
      />
    );
  }

  if (visibleFields.financialPeriodId) {
    extraFilters.push(
      <SearchableSelect
        key="period"
        label="الفترة المالية"
        value={filters.financialPeriodId || ''}
        onChange={(event) =>
          handleChange('financialPeriodId', event.target.value)
        }
        placeholder="كل الفترات"
        options={periodOptions}
      />
    );
  }

  if (visibleFields.accountId) {
    extraFilters.push(
      <SearchableSelect
        key="account"
        label="الحساب"
        value={filters.accountId || ''}
        onChange={(event) => handleChange('accountId', event.target.value)}
        placeholder="كل الحسابات"
        options={accountOptions}
      />
    );
  }

  return (
    <FilterBar
      className={className}
      primaryFilters={primaryFilters}
      extraFilters={extraFilters}
      onReset={handleReset}
      activeCount={activeFilterCount}
      extraCount={advancedFilterCount}
    />
  );
};

export default JournalEntryFilters;
