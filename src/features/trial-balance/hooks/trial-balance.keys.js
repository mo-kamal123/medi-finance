export const trialBalanceKeys = {
  all: ['trial-balance'],
  list: (filters) => [...trialBalanceKeys.all, filters],
};
