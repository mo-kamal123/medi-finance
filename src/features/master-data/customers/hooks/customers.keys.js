export const customersKeys = {
  all: ['customers'],
  lists: (filters) => [...customersKeys.all, 'list', filters],
  detail: (id) => [...customersKeys.all, id],
  policies: (id) => [...customersKeys.all, 'policies', { customerId: id, isWithWataniya: true }],
};
