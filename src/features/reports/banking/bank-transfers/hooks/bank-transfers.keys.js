export const bankTransfersReportKeys = {
  all: ['bank-transfers-report'],
  list: (filters = {}) => [...bankTransfersReportKeys.all, 'list', filters],
};