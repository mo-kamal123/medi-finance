import { Loader } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد العملية',
  description = 'هل أنت متأكد من رغبتك بتنفيذ هذه العملية؟',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  isLoading,
  loadingText = 'جاري الحذف...',
  children,
  confirmClassName = 'bg-red-600 hover:bg-red-700',
  disabled = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-right">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-500">{description}</p>

        {children}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (!isLoading && !disabled) {
                onConfirm();
                onClose();
              }
            }}
            disabled={isLoading || disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white disabled:opacity-60 ${confirmClassName}`}
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
