import AccountForm from '../components/AccountForm';

const UpdateAccount = ({ accountData, parentAccounts }) => {
  const handleUpdate = async (data) => {
    console.log('Update:', data);
    // API PUT
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">
              تحديث الحساب
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              يمكنك تعديل بيانات الحساب وحفظ التغييرات
            </p>
          </div>

          {/* Form */}
          <AccountForm
            mode="update"
            defaultValues={accountData}
            parentAccounts={parentAccounts}
            onSubmit={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateAccount;
