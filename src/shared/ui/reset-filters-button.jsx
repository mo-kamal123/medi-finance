import { RotateCcw } from 'lucide-react';

const ResetFiltersButton = ({ onReset, active, filters = {} }) => {
  const visible =
    active ??
    Object.entries(filters).some(
      ([key, value]) =>
        key !== 'pageNumber' &&
        key !== 'pageSize' &&
        value != null &&
        String(value).trim() !== ''
    );

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onReset}
      aria-label="مسح الفلاتر"
      title="مسح الفلاتر"
      className="absolute top-0 left-0 inline-flex h-11 items-center justify-center rounded-lg px-4 text-gray-600 transition-colors hover:text-red-600 focus-visible:outline-primary"
    >
      <RotateCcw size={16} aria-hidden="true" />
    </button>
  );
};

export default ResetFiltersButton;
