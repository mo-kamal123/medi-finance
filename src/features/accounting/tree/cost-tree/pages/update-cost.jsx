import { Link, useParams } from 'react-router-dom';
import { PencilLine } from 'lucide-react';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import PageLoader from '../../../../../shared/ui/page-loader';
import CostCenterForm from '../components/cost-form';
import useCostTree from '../hooks/use-cost-tree';
import useCostById from '../hooks/use-cost-by-id';
import useUpdateCost from '../hooks/use-update-cost';

const UpdateCost = () => {
  const { id } = useParams();
  const { data: centerData, isPending, isError, refetch } = useCostById(id);
  const { data: parentCenters = [] } = useCostTree();
  const { mutate, isPending: isUpdating } = useUpdateCost();

  const handleUpdate = (data) => {
    mutate({
      id,
      body: data,
    });
  };

  if (isPending) return <PageLoader label="جاري تحميل مركز التكلفة..." />;
  if (isError || !centerData) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
      >
        تعذر تحميل مركز التكلفة.
        <button
          type="button"
          className="mx-3 underline"
          onClick={() => void refetch()}
        >
          إعادة المحاولة
        </button>
        <Link to="/cost-tree" className="underline">
          العودة إلى شجرة مراكز التكلفة
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto w-full">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'شجرة مراكز التكلفة', to: '/cost-tree' },
              { label: centerData.nameAr || 'تفاصيل مركز التكلفة' },
            ]}
          />
        </div>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-6 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <PencilLine size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {centerData.nameAr || 'تحديث مركز تكلفة'}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                يمكنك تعديل بيانات المركز وحفظ التغييرات
              </p>
            </div>
          </div>
        </header>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <CostCenterForm
            key={id}
            mode="update"
            defaultValues={centerData}
            parentCenters={parentCenters}
            onSubmit={handleUpdate}
            isPending={isUpdating}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateCost;
