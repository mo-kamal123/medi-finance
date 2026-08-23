import { useMemo, useState } from 'react';
import {
  Download,
  FileSearch,
  FileX,
  UserCheck,
} from 'lucide-react';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import PageLoader from '../../../../../shared/ui/page-loader';
import GeneralLedgerTable from './general-ledger-table';
import GeneralLedgerFilter from './general-ledger-filter';
import { useGeneralLedger } from '../hooks/general-ledger.queries';
import { useGeneralLedgerExport } from '../hooks/use-general-ledger-export';
import { buildGeneralLedgerQueryParams } from '../utils/general-ledger-filters.utils';
import { DEFAULT_GENERAL_LEDGER_FILTERS } from '../utils/general-ledger-filters.utils';
import { formatCurrency } from '../../../../../shared/utils/formatters';

const PartyAccountStatement = ({
  partyLabel,
  partyIdField,
  usePartyList,
  hiddenFilterFields = {},
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
}) => {
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [filters, setFilters] = useState(DEFAULT_GENERAL_LEDGER_FILTERS);
  const { handleExport, isExporting } = useGeneralLedgerExport();

  const { data: parties = [] } = usePartyList();

  const partyOptions = useMemo(
    () =>
      parties.map((party) => ({
        value: String(party[partyIdField.idKey] ?? party.id ?? ''),
        label:
          party[partyIdField.nameArKey] ||
          party[partyIdField.nameEnKey] ||
          '',
      })),
    [parties, partyIdField]
  );

  const queryParams = useMemo(
    () =>
      selectedPartyId
        ? buildGeneralLedgerQueryParams({
            ...filters,
            [partyIdField.filterKey]: selectedPartyId,
          })
        : undefined,
    [selectedPartyId, partyIdField, filters]
  );

  const { data, isLoading } = useGeneralLedger(queryParams, {
    enabled: !!selectedPartyId,
  });

  const entries = data ?? [];

  const totalDebit = useMemo(
    () => entries.reduce((sum, e) => sum + (Number(e.debitAmount) || 0), 0),
    [entries]
  );

  const totalCredit = useMemo(
    () => entries.reduce((sum, e) => sum + (Number(e.creditAmount) || 0), 0),
    [entries]
  );

  const netBalance = useMemo(() => totalDebit - totalCredit, [totalDebit, totalCredit]);

  const selectedParty = partyOptions.find(
    (opt) => opt.value === selectedPartyId
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileSearch size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              كشف حساب {partyLabel}
            </h1>
            <p className="text-sm text-gray-500">
              عرض جميع الحركات المحاسبية لـ {partyLabel} مع الرصيد الجاري
            </p>
          </div>
        </div>
        {selectedPartyId && entries.length > 0 ? (
          <button
            type="button"
            onClick={() => handleExport(queryParams)}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Download size={16} />
            {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </button>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 p-5 shadow-sm">
        <div className="max-w-lg">
          <SearchableSelect
            label={`اختر ${partyLabel}`}
            value={selectedPartyId}
            onChange={(event) => setSelectedPartyId(event.target.value)}
            placeholder={`ابحث عن ${partyLabel}...`}
            options={partyOptions}
            searchPlaceholder={`ابحث عن ${partyLabel}...`}
          />
        </div>
      </div>

      {selectedPartyId ? (
        <GeneralLedgerFilter
          filters={filters}
          setFilters={setFilters}
          hiddenFields={hiddenFilterFields}
        />
      ) : null}

      {!selectedPartyId ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-8 text-center">
          {EmptyIcon ? (
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
              <EmptyIcon className="h-10 w-10 text-gray-400" />
            </div>
          ) : null}
          <h3 className="text-lg font-semibold text-gray-600">{emptyTitle}</h3>
          <p className="mt-1.5 max-w-sm text-sm text-gray-400">{emptyDescription}</p>
        </div>
      ) : isLoading ? (
        <PageLoader label={`جاري تحميل كشف حساب ${partyLabel}...`} />
      ) : entries.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
            <FileX className="h-8 w-8 text-amber-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            لا توجد حركات محاسبية
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {selectedParty?.label || partyLabel}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gradient-to-l from-primary/5 to-transparent px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {selectedParty?.label || partyLabel}
                  </h2>
                  <p className="text-xs text-gray-500">
                    عدد الحركات: {entries.length}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="text-left">
                  <p className="text-xs text-gray-500">إجمالي مدين</p>
                  <p className="text-sm font-bold text-green-600">
                    {formatCurrency(totalDebit)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">إجمالي دائن</p>
                  <p className="text-sm font-bold text-red-600">
                    {formatCurrency(totalCredit)}
                  </p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">صافي الرصيد</p>
                  <p
                    className={`text-sm font-bold ${
                      netBalance >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(Math.abs(netBalance))}
                    <span className="mr-1 text-xs font-normal">
                      {netBalance >= 0 ? 'مدين' : 'دائن'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <GeneralLedgerTable data={entries} loading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyAccountStatement;
