export const banksKeys = {
  all: ['banks'],
  lists: (filters = {}) => [...banksKeys.all, 'list', filters],
  detail: (id) => [...banksKeys.all, 'detail', id],
  accounts: (bankId) => [...banksKeys.all, 'accounts', bankId],
  accountDetail: (id) => [...banksKeys.all, 'account-detail', id],
};
