export const invoicesKeys = {
  all: ['invoices'],

  lists: () => [...invoicesKeys.all, 'list'],

  list: (filters) => [...invoicesKeys.lists(), filters],

  details: () => [...invoicesKeys.all, 'detail'],

  detail: (id) => [...invoicesKeys.details(), id],

  batch: (batchNumber) => [...invoicesKeys.all, 'batch', batchNumber],

  types: () => [...invoicesKeys.all, 'types'],

  suppliers: () => [...invoicesKeys.all, 'suppliers'],

  customers: () => [...invoicesKeys.all, 'customers'],

  financial: () => [...invoicesKeys.all, 'financial-periods'],

  services: () => [...invoicesKeys.all, 'products-services'],

  nextNumber: () => [...invoicesKeys.all, 'next-number'],

  statuses: () => [...invoicesKeys.all, 'statuses'],
};
