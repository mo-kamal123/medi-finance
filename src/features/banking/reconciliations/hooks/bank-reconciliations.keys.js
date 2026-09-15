export const bankReconciliationsKeys = {
  all: ['bank-reconciliations'],
  lists: (filters = {}) => [...bankReconciliationsKeys.all, 'list', filters],
  detail: (id) => [...bankReconciliationsKeys.all, 'detail', id],
  items: (id, filters = {}) => [...bankReconciliationsKeys.all, 'items', id, filters],
};
