import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import CostCenterForm from '../components/cost-form';
import useCostTree from '../hooks/use-cost-tree';
import useCreateCost from '../hooks/use-create-cost';

const NewCost = () => {
  const [searchParams] = useSearchParams();
  const { data: parentCenters = [] } = useCostTree();
  const { mutateAsync, isPending } = useCreateCost();
  const defaultValues = useMemo(
    () => ({ parentID: searchParams.get('parentID') || 0 }),
    [searchParams]
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto w-full">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'شجرة مراكز التكلفة', to: '/cost-tree' },
              { label: 'إضافة مركز تكلفة' },
            ]}
          />
        </div>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-6 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <FolderPlus size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">إضافة مركز تكلفة جديد</h1>
              <p className="mt-1 text-sm text-white/80">
                قم بإدخال بيانات المركز لإضافته إلى شجرة مراكز التكلفة
              </p>
            </div>
          </div>
        </header>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <CostCenterForm
            mode="create"
            defaultValues={defaultValues}
            parentCenters={parentCenters}
            onSubmit={async (values) => {
              try {
                await mutateAsync(values);
              } catch {
                // The mutation displays the server error.
              }
            }}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default NewCost;
