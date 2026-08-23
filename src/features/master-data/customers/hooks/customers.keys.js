export const customersKeys = {
  all: ['customers'],
  lists: (filters) => [...customersKeys.all, 'list', filters],
  detail: (id) => [...customersKeys.all, id],
};
