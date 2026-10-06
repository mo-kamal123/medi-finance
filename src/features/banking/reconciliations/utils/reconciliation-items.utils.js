// JS helpers for the multi-match reconciliation contract (no TS).
// Backend returns both camelCase and PascalCase in this project, so every
// getter checks both casings. Presence of `systemTransactions` does NOT mean
// matched — always rely on status / isCleared.

export const getItemId = (item) =>
  item?.id ??
  item?.itemId ??
  item?.itemID ??
  item?.reconciliationItemId ??
  item?.reconciliationItemID;

export const getItemStatusKey = (item) =>
  item?.status ?? item?.statusCode ?? item?.statusName ?? '';

export const isItemMatched = (item) => {
  const key = getItemStatusKey(item);
  if (key === 'Matched' || key === 'Adjusted') return true;
  if (typeof item?.isCleared === 'boolean') return item.isCleared;
  if (typeof item?.IsCleared === 'boolean') return item.IsCleared;
  return false;
};

export const isReconciliationClosed = (details) => {
  const status = details?.status ?? details?.statusCode ?? '';
  const statusName = details?.statusName ?? details?.status ?? '';
  return (
    status === 'Reconciled' ||
    status === 'Cancelled' ||
    statusName === 'Reconciled' ||
    statusName === 'Cancelled'
  );
};

// Full current selection for a bank item (edit mode pre-checks all of these).
export const getBankTransactionIDs = (item) => {
  const raw =
    item?.bankTransactionIDs ??
    item?.BankTransactionIDs ??
    item?.bankTransactionIds ??
    [];
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map(Number).filter((n) => Number.isFinite(n) && n > 0))];
};

// Linked system moves. May exist on UNMATCHED items too — check isItemMatched.
export const getSystemTransactions = (item) => {
  const list =
    item?.systemTransactions ??
    item?.SystemTransactions ??
    // legacy single-transaction compat
    (item?.systemTransaction ? [item.systemTransaction] : []) ??
    (item?.SystemTransaction ? [item.SystemTransaction] : []) ??
    [];
  return Array.isArray(list) ? list.filter(Boolean) : [];
};

export const getSystemTxId = (tx) =>
  Number(
    tx?.transactionID ??
      tx?.transactionId ??
      tx?.TransactionID ??
      tx?.id ??
      tx?.bankTransactionID ??
      tx?.bankTransactionId ??
      0
  ) || 0;

// Backend total when matched, 0 when unmatched. Recompute on client for display.
export const getMatchedSystemAmount = (item) => {
  const raw =
    item?.matchedSystemAmount ??
    item?.MatchedSystemAmount ??
    item?.matchedAmount ??
    0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
};

// Bank statement amount stays the bank amount — never add system amounts to it.
export const getBankItemAmount = (item) => {
  const bankTx =
    item?.bankTransaction ??
    item?.bankStatementTransaction ??
    item?.statementTransaction ??
    null;
  const raw = item?.amount ?? bankTx?.amount ?? 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
};

// ---- currency-safe decimals (avoid JS float errors, compare at 2 decimals) ----
export const toCents = (value) => Math.round(Number(value) * 100);

export const sumAmounts = (txs) =>
  txs.reduce((acc, tx) => acc + (Number(tx?.amount ?? 0) || 0), 0);

export const amountsEqual2 = (a, b) => toCents(a) === toCents(b);

export const hasDuplicateIDs = (ids) => new Set(ids.map(Number)).size !== ids.length;
