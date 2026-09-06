import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournalEntries } from './entries.queries';
import {
  buildJournalEntryQueryParams,
  DEFAULT_JOURNAL_ENTRY_FILTERS,
} from '../utils/journal-entry-filters.utils';

const useDailyEntries = () => {
  const [filters, setFilters] = useState(DEFAULT_JOURNAL_ENTRY_FILTERS);
  const navigate = useNavigate();

  const queryParams = useMemo(
    () => buildJournalEntryQueryParams(filters),
    [filters]
  );

  const { data, isLoading } = useJournalEntries(queryParams);

  const entries = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (pageNumber) =>
    setFilters((prev) => ({ ...prev, pageNumber }));

  const handlePageSizeChange = (pageSize) =>
    setFilters((prev) => ({ ...prev, pageSize, pageNumber: 1 }));

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