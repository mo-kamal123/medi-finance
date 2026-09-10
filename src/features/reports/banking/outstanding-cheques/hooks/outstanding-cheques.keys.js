export const outstandingChequesKeys = {
  all: ['outstanding-cheques'],
  list: (filters = {}) => [...outstandingChequesKeys.all, 'list', filters],
};