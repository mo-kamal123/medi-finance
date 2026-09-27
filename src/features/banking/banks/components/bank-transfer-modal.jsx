import { useState } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { cn } from '../../../../shared/lib/cn';
import BankTransferForm from './bank-transfer-form';

const BankTransferModal = ({ bankId, isOpen, onClose, onSuccess }) => {
  const [confirmStage, setConfirmStage] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setConfirmStage(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (!confirmStage && e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={cn(
          'max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl',
          confirmStage && 'hidden'
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowLeftRight size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">تحويل جديد</h3>
              <p className="text-sm text-gray-500">إنشاء تحويل بنكي جديد</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        <BankTransferForm
          bankId={bankId}
          onConfirmStageChange={setConfirmStage}
          onSuccess={(transferId) => {
            handleClose();
            onSuccess?.(transferId);
          }}
        />
      </div>
    </div>
  );
};

export default BankTransferModal;
