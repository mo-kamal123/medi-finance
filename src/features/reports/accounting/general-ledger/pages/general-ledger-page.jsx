import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import PageLoader from '../../../../../shared/ui/page-loader';
import { useGeneralLedger } from '../hooks/general-ledger.queries';
import { useGeneralLedgerExport } from '../hooks/use-general-ledger-export';
import GeneralLedgerTable from '../components/general-ledger-table';
import GeneralLedgerFilter from '../components/general-ledger-filter';
import { DEFAULT_GENERAL_LEDGER_FILTERS } from '../utils/general-ledger-filters.utils';
import { buildGeneralLedgerQueryParams } from '../utils/general-ledger-filters.utils';

const GeneralLedgerPage = () => {
  const [searchParams] = useSearchParams();
  const initialAccountId = searchParams.get('accountId') || '';

  const [filters, setFilters] = useState({
    ...DEFAULT_GENERAL_LEDGER_FILTERS,
    ...(initialAccountId ? { accountId: initialAccountId } : {}),
  });

  const queryParams = useMemo(
    () => buildGeneralLedgerQueryParams(filters),
    [filters]
  );

  const hasFilters = Object.keys(queryParams).length > 0;
  const { data, isLoading } = useGeneralLedger(queryParams, {
    enabled: hasFilters,
  });
  const { handleExport, isExporting } = useGeneralLedgerExport();

  const entries = hasFilters ? (data ?? []) : [];

  if (isLoading && !entries.length) {
    return <PageLoader label="جاري تحميل دفتر الأستاذ العام..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">دفتر الأستاذ العام</h1>
          <p className="mt-1 text-sm text-gray-600">
            عرض الحركات المحاسبية مجمعة حسب الحساب مع الرصيد
          </p>
        </div>
        <button
          type="button"
          onClick={() => hasFilters && handleExport(queryParams)}
          disabled={!hasFilters || isExporting}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
        </button>
      </div>

      <GeneralLedgerFilter filters={filters} setFilters={setFilters} />

      <div className="overflow-hidden rounded-xl">
        {hasFilters ? (
          <GeneralLedgerTable data={entries} loading={isLoading} />
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-gray-500">
            اختر فلترًا واحدًا على الأقل لعرض دفتر الأستاذ العام
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralLedgerPage;
