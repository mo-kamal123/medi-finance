export const bankCashFlowKeys = {
  all: ['bank-cash-flow'],
  list: (filters = {}) => [...bankCashFlowKeys.all, 'list', filters],
};