import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import ChequeForm from '../components/cheque-form';
import { useCheque, useChequeStatuses } from '../hooks/cheques.queries';
import { useUpdateChequeStatus, useUpdateCheque } from '../hooks/cheques.mutations';

const ChequeDetails = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useCheque(id);
  const { data: statuses = [] } = useChequeStatuses();
  const { mutate: updateCheque, isPending } = useUpdateCheque();
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateChequeStatus();

  const statusOptions = useMemo(
    () =>
      (Array.isArray(statuses) ? statuses : []).map((s) => ({
        value: String(s.id ?? s.Id ?? s.statusID ?? s.statusId),
        label: s.NameAr || s.nameAr || s.Name || s.name || '',
      })),
    [statuses]
  );

  const handleStatusChange = useCallback(
    (statusID) => {
      if (!statusID) return;
      updateStatus(
        { id: Number(id), statusID: Number(statusID) },
        { onSuccess: () => refetch() }
      );
    },
    [id, updateStatus, refetch]
  );

  if (isLoading) {
    return <PageLoader label="جاري تحميل بيانات الشيك..." />;
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">لا توجد بيانات.</div>
    );
  }

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
      </div>
      <ChequeForm
        defaultValues={data}
        mode="edit"
        isPending={isPending}
        onSubmit={handleEditSubmit}
        onStatusChange={handleStatusChange}
        isStatusUpdating={isStatusUpdating}
      />
    </div>
  );
};

export default ChequeDetails;
