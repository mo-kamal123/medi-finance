export const bankTransactionsReportKeys = {
  all: ['bank-transactions-report'],
  list: (filters = {}) => [...bankTransactionsReportKeys.all, 'list', filters],
};