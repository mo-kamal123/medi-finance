export const suppliersKeys = {
  all: ['suppliers'],
  lists: (filters = {}) => [...suppliersKeys.all, 'list', filters],
  detail: (id) => [...suppliersKeys.all, 'detail', id],
};
