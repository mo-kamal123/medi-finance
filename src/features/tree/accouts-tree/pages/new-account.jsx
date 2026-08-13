import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, FolderPlus } from 'lucide-react';
import AccountForm from '../components/AccountForm';
import useCreateAccount from '../hooks/use-create-account';

const NewAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutateAsync } = useCreateAccount();

  const defaultValues = useMemo(() => {
    const parentId = searchParams.get('parentId');
    return {
      parentId: parentId ? String(parentId) : '',
      nameAr: '',
      nameEn: '',
      accountTypeId: '',
      lockedInJournal: false,
      isActive: true,
    };
  }, [searchParams]);

  const handleCreate = async (formData) => {
    await mutateAsync(
      {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        parentId: formData.parentId,
        accountTypeId: formData.accountTypeId,
        lockedInJournal: formData.lockedInJournal,
        isActive: formData.isActive,
      },
      { onSuccess: () => navigate('/accounts-tree') }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/accounts-tree')}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition hover:bg-gray-100"
          >
            <ArrowRight size={18} />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderPlus size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              إضافة حساب جديد
            </h2>
            <p className="text-sm text-gray-500">
              قم بإدخال بيانات الحساب لإضافته إلى شجرة الحسابات
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <AccountForm
            mode="create"
            defaultValues={defaultValues}
            onSubmit={handleCreate}
          />
        </div>
      </div>
    </div>
  );
};

export default NewAccount;
