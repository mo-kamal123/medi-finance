import CostCenterForm from '../components/cost-form';

const NewCost = ({ parentCenters }) => {
  const handleCreate = async (data) => {
    console.log('Create:', data);
    // هنا تستدعي API POST
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
        />
      </div>
    </div>
  );
};

export default NewCost;
