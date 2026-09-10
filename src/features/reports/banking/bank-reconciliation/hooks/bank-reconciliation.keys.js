export const bankReconciliationKeys = {
  all: ['bank-reconciliation'],
  list: (filters = {}) => [...bankReconciliationKeys.all, 'list', filters],
};