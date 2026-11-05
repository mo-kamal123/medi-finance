export const customersKeys = {
  all: ['customers'],
  lists: (filters) => [...customersKeys.all, 'list', filters],
  detail: (id) => [...customersKeys.all, id],
  policies: (id, isWithWataniya = true) => [...customersKeys.all, 'policies', { customerId: id, isWithWataniya }],
};
