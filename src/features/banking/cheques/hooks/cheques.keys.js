export const chequesKeys = {
  all: ['cheques'],
  lists: (filters = {}) => [...chequesKeys.all, 'list', filters],
  detail: (id) => [...chequesKeys.all, 'detail', String(id)],
  statuses: (type) => [...chequesKeys.all, 'statuses', type],
  banks: () => [...chequesKeys.all, 'banks'],
  customers: () => [...chequesKeys.all, 'customers'],
  suppliers: () => [...chequesKeys.all, 'suppliers'],
  currencies: () => [...chequesKeys.all, 'currencies'],
};
