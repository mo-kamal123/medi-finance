export const chequesKeys = {
  all: ['cheques'],
  lists: (filters) => [...chequesKeys.all, 'list', filters],
  detail: (id) => [...chequesKeys.all, 'detail', id],
  statuses: () => [...chequesKeys.all, 'statuses'],
  pending: (params) => [...chequesKeys.all, 'pending', params],
  banks: () => [...chequesKeys.all, 'banks'],
  customers: () => [...chequesKeys.all, 'customers'],
  suppliers: () => [...chequesKeys.all, 'suppliers'],
  currencies: () => [...chequesKeys.all, 'currencies'],
};
