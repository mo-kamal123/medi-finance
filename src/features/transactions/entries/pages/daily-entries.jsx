import { Plus } from 'lucide-react';
import PageLoader from '../../../../shared/ui/page-loader';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import JournalEntryFilters from '../components/journal-entry-filters';
import useDailyEntries from '../hooks/use-daily-entries';
import { entriesCols } from '../utils/journal-entry.utils';

const DailyEntriesPage = () => {
  // All page state, data fetching, and handlers live in this hook
  const {
    entries,
    totalPages,
    filters,
    setFilters,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    handleRowClick,
    handleAddEntry,
  } = useDailyEntries();

  if (isLoading && !entries.length) {
    return <PageLoader label="جاري تحميل القيود اليومية..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: 'القيود اليومية' }]} />

      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold md:text-2xl">القيود اليومية</h1>
          <p className="text-sm text-gray-600">
            إدارة جميع القيود اليومية بسهولة.
          </p>
        </div>

        <button
          onClick={handleAddEntry}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          إضافة قيد جديد
        </button>
      </div>

      <JournalEntryFilters filters={filters} setFilters={setFilters} />

      <div className="overflow-hidden rounded-xl bg-white">
        <Table
          columns={entriesCols}
          data={entries}
          loading={isLoading}
          onRowClick={handleRowClick}
        />
      </div>

      <Pagination
        currentPage={filters.pageNumber}
        totalPages={totalPages}
        pageSize={filters.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default DailyEntriesPage;