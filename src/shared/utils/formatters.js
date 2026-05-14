export const ENGLISH_NUMBER_LOCALE = 'en-US';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export const toEnglishDigits = (value) =>
  String(value)
    .replace(/[٠-٩]/g, (digit) => ARABIC_DIGITS.indexOf(digit))
    .replace(/[۰-۹]/g, (digit) => PERSIAN_DIGITS.indexOf(digit));

export const formatNumber = (value = 0, options = {}) =>
  toEnglishDigits(
    new Intl.NumberFormat(ENGLISH_NUMBER_LOCALE, options).format(
      Number(value) || 0
    )
  );

export const formatCurrency = (value = 0, options = {}) =>
  formatNumber(value, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
    ...options,
  });

export const formatDate = (value, options = {}) =>
  value
    ? toEnglishDigits(
        new Date(value).toLocaleDateString(ENGLISH_NUMBER_LOCALE, options)
      )
    : '-';

export const formatDisplayValue = (value) => {
  if (value === null || value === undefined) return value;
  if (['bigint', 'number', 'string'].includes(typeof value)) {
    return toEnglishDigits(value);
  }
  return value;
};
