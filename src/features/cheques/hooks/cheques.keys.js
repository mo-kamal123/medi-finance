export const chequesKeys = {
  all: ['cheques'],
  lists: (filters) => [...chequesKeys.all, 'list', filters],
  detail: (id) => [...chequesKeys.all, 'detail', id],
  banks: () => [...chequesKeys.all, 'banks'],
  customers: () => [...chequesKeys.all, 'customers'],
};
