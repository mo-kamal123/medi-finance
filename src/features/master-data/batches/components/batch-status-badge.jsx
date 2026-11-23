const statusColors = {
  'مرسل للمالية': 'bg-blue-100 text-blue-700',
  'مدفوع': 'bg-emerald-100 text-emerald-700',
  'مدفوع جزئيا': 'bg-amber-100 text-amber-700',
  'مرسل للمطالبات': 'bg-violet-100 text-violet-700',
  'مستلم': 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-700',
  open: 'bg-amber-100 text-amber-700',
};

const BatchStatusBadge = ({ status }) => {
  const normalized = String(status ?? '').trim().toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '').replace(/\s+/g, ' ');
  const color = statusColors[normalized] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      {normalized === 'closed' ? 'مغلقة' : normalized === 'open' ? 'مفتوحة' : String(status ?? '').trim() || '-'}
    </span>
  );
};

export default BatchStatusBadge;
