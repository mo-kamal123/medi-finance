const routeResources = new Map([
  ['', 'Dashboard'],
  ['accounts-tree', 'ChartOfAccounts'],
  ['cost-tree', 'CostCenters'],
  ['link', 'AccountCostCenterLink'],
  ['invoices', 'Invoices'],
  ['customers-invoices', 'Invoices'],
  ['suppliers-invoices', 'Invoices'],
  ['batches-invoices', 'Invoices'],
  ['entries', 'Journal'],
  ['cash-transactions', 'CashTransactions'],
  ['cash-vouchers', 'CashVouchers'],
  ['commercial-papers', 'CommercialPapers'],
  ['banks', 'Banks'],
  ['cheques', 'Cheques'],
  ['reconciliations', 'BankReconciliations'],
  ['customers', 'Customers'],
  ['suppliers', 'Suppliers'],
  ['batches', 'Batches'],
  ['users', 'Users'],
  ['roles', 'Roles'],
  ['bank-statement', 'BankStatement'],
  ['bank-transactions', 'BankTransactionsReport'],
  ['bank-balances', 'BankBalances'],
  ['bank-reconciliation', 'BankReconciliation'],
  ['bank-transfers', 'BankTransfersReport'],
  ['cheques-report', 'BankCheques'],
  ['outstanding-cheques', 'BankOutstandingCheques'],
  ['cash-flow', 'BankCashFlow'],
  ['balance-sheet', 'BalanceSheet'],
  ['income-statement', 'IncomeStatement'],
  ['trial-balance', 'TrialBalance'],
  ['general-ledger', 'GeneralLedger'],
  ['aging-report', 'ARAging'],
]);

export const canViewRoute = (permissions, pathname) => {
  const section = pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
  const resource = routeResources.get(section);
  return Boolean(resource && permissions?.[resource]?.View === true);
};

export const filterNavigation = (items, permissions) =>
  items.flatMap((item) => {
    if (!item.sub) return canViewRoute(permissions, item.link) ? [item] : [];

    const sub = filterNavigation(item.sub, permissions);
    return sub.length ? [{ ...item, sub }] : [];
  });
