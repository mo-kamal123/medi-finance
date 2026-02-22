import CostCenterForm from "../components/cost-form";

const UpdateCost = ({ centerData, parentCenters }) => {
  const handleUpdate = async (data) => {
    console.log("Update:", data);
    // هنا تستدعي API PUT
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">تحديث مركز تكلفة</h2>
        <p className="text-gray-500 text-sm mb-6">يمكنك تعديل بيانات المركز وحفظ التغييرات</p>

        <CostCenterForm
          mode="update"
          defaultValues={centerData}
          parentCenters={parentCenters}
          onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
};

export default UpdateCost;
