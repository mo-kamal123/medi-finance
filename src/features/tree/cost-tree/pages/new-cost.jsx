import CostCenterForm from '../components/cost-form';
import useCostTree from '../hooks/use-cost-tree';
import useCreateCost from '../hooks/use-create-cost';

const NewCost = () => {
  const { data: parentCenters = [] } = useCostTree();
  const { mutate, isPending } = useCreateCost();

  const handleCreate = (data) => {
    mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          إضافة مركز تكلفة جديد
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          قم بإدخال بيانات المركز الجديد
        </p>

        <CostCenterForm
          mode="create"
          parentCenters={parentCenters}
          onSubmit={handleCreate}
          isSubmitting={isPending}
        />
      </div>
    </div>
  );
};

export default NewCost;