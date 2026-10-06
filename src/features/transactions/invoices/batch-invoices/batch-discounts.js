const BATCH_DISCOUNT_FIELDS = [
  { key: 'medicalDiscount', label: 'خصم طبي' },
  { key: 'technicalDiscount', label: 'خصم فني' },
  { key: 'contractPriceDifferences', label: 'فروق أسعار التعاقد' },
  { key: 'copaymentAndDiscountDifferences', label: 'فروق التحمل والخصم' },
];

export const DISCOUNT_SOURCE_OPTIONS = [
  { value: 'netAmount', label: 'الصافي' },
  { value: 'beforeCopayment', label: 'قبل التحمل' },
];

const FINANCE_DISCOUNTS = [
  { type: 1, label: 'مصاريف إداريه', name: 'مصاريف إدارية' },
  { type: 2, label: 'خصم منبع', name: 'خصم منبع' },
];

export const initializeDiscountRows = (batchDiscounts) => [
  ...BATCH_DISCOUNT_FIELDS.map(({ key, label }) => ({
    discountType: label,
    amount: Number(batchDiscounts?.[key]) || 0,
    isFinance: false,
  })),
  ...FINANCE_DISCOUNTS.map(({ type, label }) => ({
    discountType: label,
    type,
    amount: 0,
    isFinance: true,
    percentage: 0,
    source: 'netAmount',
  })),
];

export const buildFinanceDiscountPayload = (discounts) => discounts
  .filter((discount) => discount.isFinance)
  .map((discount) => ({
    name: FINANCE_DISCOUNTS.find((definition) => definition.type === discount.type).name,
    type: discount.type,
    percentage: Number(discount.percentage) || 0,
    source: discount.source === 'beforeCopayment' ? 2 : 1,
  }));

export const updateFinanceDiscount = (discount, field, value, bases) => {
  if (!discount.isFinance) return discount;

  const updated = { ...discount, [field]: value };
  const base = Math.max(Number(bases[updated.source]) || 0, 0);

  if (field === 'amount') {
    updated.amount = value === '' ? '' : Math.max(Number(value) || 0, 0);
    updated.percentage = base > 0
      ? Number(((Number(updated.amount) / base) * 100).toFixed(6))
      : 0;
  } else if (field === 'percentage' || field === 'source') {
    updated.percentage = updated.percentage === ''
      ? ''
      : Math.max(Number(updated.percentage) || 0, 0);
    updated.amount = Number(((base * Number(updated.percentage)) / 100).toFixed(2));
  }

  return updated;
};
