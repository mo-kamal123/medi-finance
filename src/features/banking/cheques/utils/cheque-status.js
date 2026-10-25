const normalize = (value) =>
  String(value ?? '')
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ');
const flows = {
  0: ['تم الاستلام', 'تحت التحصيل', 'تم التحصيل', 'مرفوض', 'مرتد'],
  1: ['تم الإصدار', 'تم الصرف', 'مرفوض', 'مرتد'],
};
export const getChequeStatusAction = (label) => {
  const actions = {
    'تم الاستلام': 'استلام',
    'تحت التحصيل': 'إيداع للتحصيل',
    'تم التحصيل': 'تحصيل',
    'تم الاصدار': 'إصدار',
    'تم الصرف': 'صرف',
    'مرفوض': 'رفض',
    'مرتد': 'إرجاع',
  };
  return actions[normalize(label)] || label;
};
export const getNextChequeStatus = (options, cheque, type) => {
  const current = options.find(
    (option) =>
      String(option.value) ===
      String(cheque?.statusID ?? cheque?.statusId ?? cheque?.status ?? '')
  );
  const label = current?.label || cheque?.statusNameAr || cheque?.status;
  const flow = flows[type];
  if (!flow) return null;
  const index = flow.findIndex(
    (status) => normalize(status) === normalize(label)
  );
  if (index < 0 || index === flow.length - 1) return null;
  return (
    options.find(
      (option) =>
        normalize(option.label) === normalize(flow[index + 1]) &&
        Number.isInteger(Number(option.value)) &&
        Number(option.value) > 0
    ) || null
  );
};
