import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Banknote,
  CheckCircle2,
  Landmark,
  RotateCcw,
  Undo2,
  XCircle,
} from 'lucide-react';
import PageLoader from '../../../shared/ui/page-loader';
import ChequeForm from '../components/cheque-form';
import { useCheque } from '../hooks/cheques.queries';
import {
  useCollectCheque,
  useDepositCheque,
  usePostCheque,
  useReturnCheque,
  useCashCheque,
  useUnpostCheque,
  useUpdateCheque,
} from '../hooks/cheques.mutations';

const ChequeDetails = () => {
  const { id } = useParams();
  const [actionLoading, setActionLoading] = useState(null);
  const { data, isLoading, refetch } = useCheque(id);
  const { mutate: updateCheque, isPending } = useUpdateCheque();
  const { mutate: postCheque } = usePostCheque();
  const { mutate: unpostCheque } = useUnpostCheque();
  const { mutate: depositCheque } = useDepositCheque();
  const { mutate: collectCheque } = useCollectCheque();
  const { mutate: returnCheque } = useReturnCheque();
  const { mutate: cashCheque } = useCashCheque();

  if (isLoading) {
    return <PageLoader label="جاري تحميل بيانات الشيك..." />;
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">لا توجد بيانات.</div>
    );
  }

  const handleAction = (actionName, mutation, payload) => {
    setActionLoading(actionName);
    mutation(payload, {
      onSuccess: () => {
        setActionLoading(null);
        refetch();
      },
      onError: () => setActionLoading(null),
    });
  };

  const handleEditSubmit = (formData) => {
    updateCheque(
      { id: Number(id), ...formData },
      { onSuccess: () => refetch() }
    );
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">تفاصيل الشيك</h1>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            icon={<Undo2 size={16} />}
            label="ترحيل"
            loading={actionLoading === 'post'}
            onClick={() =>
              handleAction('post', postCheque, {
                id: Number(id),
                chequeID: Number(id),
              })
            }
          />
          <ActionButton
            icon={<RotateCcw size={16} />}
            label="إلغاء ترحيل"
            loading={actionLoading === 'unpost'}
            onClick={() =>
              handleAction('unpost', unpostCheque, {
                id: Number(id),
                chequeID: Number(id),
              })
            }
          />
          <ActionButton
            icon={<Landmark size={16} />}
            label="إيداع في البنك"
            loading={actionLoading === 'deposit'}
            onClick={() =>
              handleAction('deposit', depositCheque, {
                id: Number(id),
                chequeID: Number(id),
              })
            }
          />
          <ActionButton
            icon={<CheckCircle2 size={16} />}
            label="تحصيل"
            loading={actionLoading === 'collect'}
            onClick={() =>
              handleAction('collect', collectCheque, {
                id: Number(id),
                chequeID: Number(id),
              })
            }
          />
          <ActionButton
            icon={<XCircle size={16} />}
            label="إرجاع"
            loading={actionLoading === 'return'}
            onClick={() =>
              handleAction('return', returnCheque, {
                id: Number(id),
                chequeID: Number(id),
              })
            }
          />
          <ActionButton
            icon={<Banknote size={16} />}
            label="صرف"
            loading={actionLoading === 'cash'}
            onClick={() =>
              handleAction('cash', cashCheque, {
                id: Number(id),
                chequeID: Number(id),
              })
            }
          />
        </div>
      </div>
      <ChequeForm
        defaultValues={data}
        mode="edit"
        isPending={isPending}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
  >
    {loading ? (
      <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
    ) : (
      icon
    )}
    {label}
  </button>
);

export default ChequeDetails;
