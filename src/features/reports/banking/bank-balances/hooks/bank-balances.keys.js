export const bankBalancesKeys = {
  all: ['bank-balances'],
  list: (filters = {}) => [...bankBalancesKeys.all, 'list', filters],
};