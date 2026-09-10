export const bankStatementKeys = {
  all: ['bank-statement'],
  list: (filters = {}) => [...bankStatementKeys.all, 'list', filters],
  export: (filters = {}) => [...bankStatementKeys.all, 'export', filters],
};