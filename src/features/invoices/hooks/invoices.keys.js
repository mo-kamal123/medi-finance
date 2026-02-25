export const invoicesKeys = {
  all: ['invoices'],

  lists: (filters) => [...invoicesKeys.all, 'list', filters],

  details: () => [...invoicesKeys.all, 'detail'],

  detail: (id) => [...invoicesKeys.details(), id],

  types: () => [...invoicesKeys.all, 'types'],

  suppliers: () => [...invoicesKeys.all, 'suppliers'],

  customers: () => [...invoicesKeys.all, 'customers'],

  financial: () => [...invoicesKeys.all, 'financial-periods'],
};
