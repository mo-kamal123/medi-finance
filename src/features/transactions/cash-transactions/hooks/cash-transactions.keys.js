export const cashTransactionsKeys = {
  all: ['cash-transactions'],
  lists: (filters = {}) => [...cashTransactionsKeys.all, 'list', filters],
  balance: (filters = {}) => [...cashTransactionsKeys.all, 'balance', filters],
  detail: (id) => [...cashTransactionsKeys.all, 'detail', id],
};
