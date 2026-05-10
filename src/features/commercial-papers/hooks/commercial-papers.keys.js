export const commercialPapersKeys = {
  all: ['commercial-papers'],
  lists: (filters) => [...commercialPapersKeys.all, 'list', filters],
  detail: (id) => [...commercialPapersKeys.all, 'detail', id],
  cashVouchers: (filters) => [...commercialPapersKeys.all, 'cash-vouchers', filters],
  cashVoucherDetail: (id) => [...commercialPapersKeys.all, 'cash-vouchers', id],
  banks: () => [...commercialPapersKeys.all, 'banks'],
  banksList: () => [...commercialPapersKeys.all, 'banks-list'],
  bankAccounts: (bankId) => [...commercialPapersKeys.all, 'bank-accounts', bankId],
  currencies: () => [...commercialPapersKeys.all, 'currencies'],
  financialPeriods: () => [...commercialPapersKeys.all, 'financial-periods'],
};
