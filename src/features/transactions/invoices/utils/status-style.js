export const getStatusStyle = (status) => {
  const normalized = String(status || '').toLowerCase();

  if (
    normalized.includes('مدفو') ||
    normalized.includes('مرح') ||
    normalized === 'paid' ||
    normalized === 'posted'
  ) {
    return 'bg-green-100 text-green-700';
  }

  if (
    normalized.includes('متأخ') ||
    normalized === 'overdue'
  ) {
    return 'bg-red-100 text-red-700';
  }

  if (
    normalized.includes('انتظ') ||
    normalized.includes('مسود') ||
    normalized === 'pending' ||
    normalized === 'draft'
  ) {
    return 'bg-yellow-100 text-yellow-700';
  }

  return 'bg-gray-100 text-gray-700';
};
