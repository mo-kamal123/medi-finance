import { Search, Filter } from 'lucide-react';
import Input from '../ui/input';
import FormInput from '../ui/input';

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
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Search */}
      <div className="flex-1 relative">
        <FormInput
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Filter */}
      <div className="relative">
        <Filter
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full sm:w-48 pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white text-start"
        >
          <option value="all">{allLabel}</option>
          {filterOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;
