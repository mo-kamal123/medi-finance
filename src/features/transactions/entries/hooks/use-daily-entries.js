import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournalEntries } from './entries.queries';
import {
  buildJournalEntryQueryParams,
  DEFAULT_JOURNAL_ENTRY_FILTERS,
} from '../utils/journal-entry-filters.utils';

const useDailyEntries = () => {
  // Local filter state for the entries list
  const [filters, setFilters] = useState(DEFAULT_JOURNAL_ENTRY_FILTERS);
  const navigate = useNavigate();

  // Build API query params from the current filters
  const queryParams = useMemo(
    () => buildJournalEntryQueryParams(filters),
    [filters]
  );

  // Fetch the paginated journal entries
  const { data, isLoading } = useJournalEntries(queryParams);

  const entries = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Update the current page
  const handlePageChange = (pageNumber) =>
    setFilters((prev) => ({ ...prev, pageNumber }));

  // Update the page size and reset to the first page
  const handlePageSizeChange = (pageSize) =>
    setFilters((prev) => ({ ...prev, pageSize, pageNumber: 1 }));

  // Navigate to the selected entry details
  const handleRowClick = (row) => navigate(`/entries/${row.journalEntryID}`);

  return {
    entries,
    totalPages,
    filters,
    setFilters,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    handleRowClick,
    handleAddEntry: () => navigate('/entries/new'),
  };
};

export default useDailyEntries;