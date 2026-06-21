export const cashVouchersKeys = {
  all: ['cash-vouchers'],
  lists: (filters) => [...cashVouchersKeys.all, 'list', filters],
  detail: (id) => [...cashVouchersKeys.all, 'detail', id],
  paymentModes: () => [...cashVouchersKeys.all, 'payment-modes'],
};
