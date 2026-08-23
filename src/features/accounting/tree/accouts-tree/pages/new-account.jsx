import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, FolderPlus } from 'lucide-react';
import AccountForm from '../components/AccountForm';
import useCreateAccount from '../hooks/use-create-account';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';

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
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'شجرة الحسابات', to: '/accounts-tree' },
              { label: 'إضافة حساب' },
            ]}
          />
        </div>
        <div className="mb-6 flex items-center gap-3">

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
