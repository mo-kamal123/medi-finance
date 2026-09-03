import SearchableSelect from '../../../../shared/ui/searchable-select';
import { cn } from '../../../../shared/lib/cn';

const CurrencyExchangeInput = ({
  currencyValue,
  exchangeRateValue,
  onCurrencyChange,
  onExchangeRateChange,
  currencyOptions = [],
  disabled,
  error,
  currencyError,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        العملة وسعر الصرف
      </label>
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-xl border bg-white transition-all',
          error || currencyError
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-gray-200'
        )}
      >
        {/* Exchange rate input */}
        <input
          type="number"
          value={exchangeRateValue ?? ''}
          onChange={onExchangeRateChange}
          disabled={disabled}
          placeholder="سعر الصرف"
          step="any"
          min="0"
          className={cn(
            'w-full bg-transparent px-3 py-2.5 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400',
            disabled ? 'cursor-not-allowed text-gray-400' : ''
          )}
        />

        {/* Currency dropdown */}
        <div className="relative w-[150px] shrink-0 border-l border-gray-200">
          <SearchableSelect
            options={currencyOptions}
            value={currencyValue ?? ''}
            onChange={(e) => onCurrencyChange(e)}
            disabled={disabled}
            placeholder=""
            searchPlaceholder="ابحث..."
            emptyMessage="لا توجد نتائج"
            className={cn(
              '!min-h-0 !rounded-none !border-0 !bg-gray-50/80 !py-0 !pr-0 !pl-0 hover:!bg-gray-100'
            )}
            inputClass="!min-h-0 !rounded-none !border-0 !bg-gray-50/80 !py-2.5 !pl-2 !pr-3 !text-sm !font-semibold !text-gray-700"
            containerClass="!w-auto"
          />
        </div>
      </div>
      {currencyError ? (
        <p className="text-xs text-red-500">{currencyError}</p>
      ) : error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
};

export default CurrencyExchangeInput;
