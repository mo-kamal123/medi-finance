import { useParams } from 'react-router-dom';
import CostCenterForm from '../components/cost-form';
import useCostTree from '../hooks/use-cost-tree';
import useCostById from '../hooks/use-cost-by-id';
import useUpdateCost from '../hooks/use-update-cost';

const UpdateCost = () => {
  const { id } = useParams();
  console.log(id);
  const { data: centerData, isPending } = useCostById(id);
  const { data: parentCenters = [] } = useCostTree();
  const { mutate, isPending: isUpdating } = useUpdateCost();

  const handleUpdate = (data) => {
    mutate({
      id,
      body: data,
    });
  };

  if (isPending) return <p>جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          تحديث مركز تكلفة
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          يمكنك تعديل بيانات المركز وحفظ التغييرات
        </p>

        <CostCenterForm
          mode="update"
          defaultValues={centerData}
          parentCenters={parentCenters}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
        />
      </div>
    </div>
  );
};

export default UpdateCost;
