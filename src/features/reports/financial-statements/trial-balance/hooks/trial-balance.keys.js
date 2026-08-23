export const trialBalanceKeys = {
  all: ['trial-balance'],
  roots: (filters) => [...trialBalanceKeys.all, 'roots', filters],
  children: (accountId, filters) => [
    ...trialBalanceKeys.all,
    'children',
    accountId,
    filters,
  ],
};
