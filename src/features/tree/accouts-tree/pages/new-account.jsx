import AccountForm from '../components/AccountForm';
import useAccountsTree from '../hooks/use-accounts-tree';
import useCreateAccount from '../hooks/use-create-account';

const NewAccount = () => {
  const { data: accountsTree = [] } = useAccountsTree();
  const { mutate, isLoading } = useCreateAccount();

  const handleCreate = (formData) => {
    console.log('Submitting form:', formData); // debug
    mutate(formData); // pass form data directly
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">
              إضافة حساب جديد
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              قم بإدخال بيانات الحساب لإضافته إلى شجرة الحسابات
            </p>
          </div>

          {/* Form */}

          <AccountForm
            mode="create"
            parentAccounts={accountsTree}
            onSubmit={handleCreate}
          />
        </div>
      </div>
    </div>
  );
};

export default NewAccount;
