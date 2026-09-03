import { useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/cn';

const FilterBar = ({
  primaryFilters = [],
  extraFilters = [],
  onReset,
  activeCount = 0,
  extraCount = 0,
  className,
}) => {
  const [showExtra, setShowExtra] = useState(false);

  return (
    <div
      className={cn(
        'relative rounded-xl border border-gray-200 bg-white p-4',
        className
      )}
    >
      {/* Primary filters row */}
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-5">
        {primaryFilters}

        {extraFilters.length > 0 ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExtra((prev) => !prev)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary"
            >
              <SlidersHorizontal size={16} />

              <span>فلاتر إضافية</span>

              {extraCount > 0 ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {extraCount}
                </span>
              ) : null}

              <ChevronDown
                size={16}
                className={cn(
                  'transition-transform duration-200',
                  showExtra && 'rotate-180'
                )}
              />
            </button>

            {/* Extra filters dropdown */}
            {showExtra ? (
              <>
                <div
                  className="fixed inset-0 z-9998"
                  onClick={() => setShowExtra(false)}
                />

                <div className="absolute left-0 top-full z-9999 mt-2 w-[320px] overflow-hidden rounded-xl border border-gray-300 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-5 py-3">
                    <p className="text-sm font-semibold text-gray-800">
                      فلاتر إضافية
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 p-5">{extraFilters}</div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="absolute top-0 left-0 inline-flex h-11 items-center justify-center gap-2 px-4 text-sm text-gray-600 transition-colors hover:border-red-300 hover:text-red-600"
          >
            <RotateCcw size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default FilterBar;
