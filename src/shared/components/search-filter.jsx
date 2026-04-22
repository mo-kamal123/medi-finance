import { Search } from 'lucide-react';
import FormInput from '../ui/input';
import SearchableSelect from '../ui/searchable-select';

const SearchFilter = ({
  searchQuery,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions = [],
  searchPlaceholder = 'Search...',
  allLabel = 'All',
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <div className="relative flex-1">
        <FormInput
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          icon={Search}
        />
      </div>

      <div className="sm:w-48">
        <SearchableSelect
          value={filterValue}
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder={allLabel}
          options={filterOptions}
        />
      </div>
    </div>
  );
};

export default SearchFilter;
