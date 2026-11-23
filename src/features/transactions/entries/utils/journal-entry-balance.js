// Compare at the same two-decimal precision used by the journal totals.
export const calculateJournalEntryBalance = (details = []) => {
  const sumCents = (field) =>
    Math.round(
      details.reduce((sum, row) => sum + (Number(row?.[field]) || 0), 0) * 100
    );
  const debitCents = sumCents('debitAmount');
  const creditCents = sumCents('creditAmount');
  return {
    totalDebit: debitCents / 100,
    totalCredit: creditCents / 100,
    isBalanced:
      Number.isSafeInteger(debitCents) &&
      Number.isSafeInteger(creditCents) &&
      debitCents > 0 &&
      debitCents === creditCents,
  };
};
