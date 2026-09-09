// Invoice form pure utilities (calculations, status options).

/**
 * Calculate the gross total for a single detail row (quantity × unitPrice).
 */
export const calculateRowTotal = (quantity, unitPrice) => {
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  return qty * price;
};

/**
 * Aggregate totals across all watched detail rows plus header-level
 * discount and tax amounts. Returns { totalAmount, totalDiscounts, netAmount }.
 */
export const calculateTotals = (details, discountAmount, taxAmount) => {
  const safeDetails = details || [];

  const totalAmount = safeDetails.reduce((sum, item) => {
    return sum + calculateRowTotal(item?.quantity, item?.unitPrice);
  }, 0);

  const detailsDiscounts = safeDetails.reduce((sum, item) => {
    const qty = Number(item?.quantity) || 0;
    const price = Number(item?.unitPrice) || 0;
    const pct = Number(item?.discountPercentage) || 0;
    return sum + (qty * price * pct) / 100;
  }, 0);

  const headerDiscount = Number(discountAmount) || 0;
  const totalDiscounts = detailsDiscounts + headerDiscount;
  const tax = Number(taxAmount) || 0;
  const netAmount = Math.max(totalAmount - totalDiscounts + tax, 0);

  return { totalAmount, totalDiscounts, netAmount };
};

/**
 * Map raw API status objects (or fall back to the hardcoded list) into
 * { value, label } options suitable for a <select>.
 */
export const buildStatusOptions = (apiStatuses, fallbackOptions) => {
  if (apiStatuses && apiStatuses.length > 0) {
    return apiStatuses.map((status) => ({
      value: String(status.id ?? status.statusId),
      label: status.nameAr ?? status.name ?? status.nameEn,
    }));
  }
  return fallbackOptions;
};
