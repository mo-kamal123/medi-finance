const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
      status === 'active'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-gray-100 text-gray-600'
    }`}
  >
    {status === 'active' ? 'نشط' : 'غير نشط'}
  </span>
);

export default StatusBadge;
