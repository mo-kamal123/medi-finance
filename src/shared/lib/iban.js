export const EGYPTIAN_IBAN_LENGTH = 29;

export const normalizeIban = (value) => value.replace(/\s+/g, '').toUpperCase();

export const isValidEgyptianIban = (value) => {
  const iban = normalizeIban(value);
  if (!/^EG[0-9]{2}[A-Z0-9]{25}$/.test(iban)) return false;

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let converted = '';
  for (const char of rearranged) {
    converted += /[A-Z]/.test(char)
      ? String(char.charCodeAt(0) - 55)
      : char;
  }
  return BigInt(converted) % 97n === 1n;
};