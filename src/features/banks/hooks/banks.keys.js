export const banksKeys = {
  all: ['banks'],
  lists: (filters = {}) => [...banksKeys.all, 'list', filters],
  detail: (id) => [...banksKeys.all, 'detail', id],
};
