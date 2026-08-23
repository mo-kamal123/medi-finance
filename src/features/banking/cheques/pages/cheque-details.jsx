import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, CreditCard, FileText, Settings } from 'lucide-react';
import PageLoader from '../../../../shared/ui/page-loader';
import ChequeForm from '../components/cheque-form';
import { useCheque, useChequeStatuses } from '../hooks/cheques.queries';
import { useUpdateChequeStatus, useUpdateCheque } from '../hooks/cheques.mutations';

const TABS = [
  { key: 'info', label: 'بيانات الشيك', icon: FileText },
  { key: 'party', label: 'العميل والبنك', icon: CreditCard },
  { key: 'accounts', label: 'الحسابات', icon: CalendarDays },
  { key: 'settings', label: 'الخصائص والملاحظات', icon: Settings },
];

const ChequeDetails = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useCheque(id);
  const { data: statuses = [] } = useChequeStatuses();
  const { mutate: updateCheque, isPending } = useUpdateCheque();
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateChequeStatus();
  const [activeTab, setActiveTab] = useState('info');

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
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">تفاصيل الشيك</h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-4 pt-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-base font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <ChequeForm
            defaultValues={data}
            mode="edit"
            isPending={isPending}
            onSubmit={handleEditSubmit}
            onStatusChange={handleStatusChange}
            isStatusUpdating={isStatusUpdating}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default ChequeDetails;
