import { useParams } from 'react-router-dom';
import AccountForm from '../components/AccountForm';
import useAccountById from '../hooks/use-account-by-Id';
import useAccountsTree from '../hooks/use-accounts-tree';
import useUpdateAccount from '../hooks/use-update-account';

const UpdateAccount = () => {
  const { id } = useParams();
  const { data: accountData, isPending, isError } = useAccountById(id);
  const { data: accountsTree = [] } = useAccountsTree();
  const { mutate, data, error } = useUpdateAccount();

  console.log('Update:', id);
  const handleUpdate = (formData) => {
    mutate({
      body: formData,
    });
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
            parentAccounts={accountsTree}
            onSubmit={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateAccount;
