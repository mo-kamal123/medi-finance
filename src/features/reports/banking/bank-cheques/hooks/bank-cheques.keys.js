export const bankChequesReportKeys = {
  all: ['bank-cheques-report'],
  list: (filters = {}) => [...bankChequesReportKeys.all, 'list', filters],
};