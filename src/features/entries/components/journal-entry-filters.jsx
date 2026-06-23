import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import DateInput from '../../../shared/ui/date-input';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import { useDebounce } from '../../../shared/lib/use-debounce';
import { useFinancialPeriods } from '../../invoices/hooks/invoices.queries';
import useAccountsTree from '../../tree/accouts-tree/hooks/use-accounts-tree';
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
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    setShowAdvanced(false);
  };

  const hasPrimaryFilters =
    visibleFields.journalEntryNumber ||
    visibleFields.referenceNumber ||
    visibleFields.journalType ||
    visibleFields.status;

  const hasAdvancedFilters =
    visibleFields.fromDate ||
    visibleFields.toDate ||
    visibleFields.financialPeriodId ||
    visibleFields.accountId;

  return (
    <div
      className={`space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm ${className}`}
    >
      {hasPrimaryFilters ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleFields.journalEntryNumber ? (
            <div className="relative">
              {/* <Search
                size={18}
                className="pointer-events-none absolute right-3 top-[38px] -translate-y-1/2 text-gray-400"
              /> */}
              <FormInput
                label="رقم القيد"
                value={localEntryNumber}
                onChange={(event) =>
                  setLocalEntryNumber(event.target.value)
                }
                placeholder="ابحث برقم القيد"
                autoFocus
              />
            </div>
          ) : null}

          {visibleFields.referenceNumber ? (
            <FormInput
              label="رقم المرجع"
              value={localRefNumber}
              onChange={(event) =>
                setLocalRefNumber(event.target.value)
              }
              placeholder="رقم المرجع"
            />
          ) : null}

          {visibleFields.journalType ? (
            <SearchableSelect
              label="نوع القيد"
              value={filters.journalType || ''}
              onChange={(event) =>
                handleChange('journalType', event.target.value)
              }
              placeholder="كل الأنواع"
              options={journalTypeOptions}
            />
          ) : null}

          {visibleFields.status ? (
            <SearchableSelect
              label="الحالة"
              value={filters.status || ''}
              onChange={(event) => handleChange('status', event.target.value)}
              placeholder="كل الحالات"
              options={statusOptions}
            />
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {hasAdvancedFilters ? (
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
        ) : (
          <span />
        )}

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

      {showAdvanced && hasAdvancedFilters ? (
        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
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

          {visibleFields.accountId ? (
            <SearchableSelect
              label="الحساب"
              value={filters.accountId || ''}
              onChange={(event) =>
                handleChange('accountId', event.target.value)
              }
              placeholder="كل الحسابات"
              options={accountOptions}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default JournalEntryFilters;
