export const bankChequesSummaryKeys = {
  all: ['bank-cheques-summary'],
  list: (filters = {}) => [...bankChequesSummaryKeys.all, 'list', filters],
};