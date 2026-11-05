import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
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
    <div className="min-h-screen p-6">
      <div className="mx-auto w-full">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'شجرة الحسابات', to: '/accounts-tree' },
              { label: 'إضافة حساب' },
            ]}
          />
        </div>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-6 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <FolderPlus size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">إضافة حساب جديد</h1>
              <p className="mt-1 text-sm text-white/80">
                قم بإدخال بيانات الحساب لإضافته إلى شجرة الحسابات
              </p>
            </div>
          </div>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
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
