import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, PencilLine } from 'lucide-react';
import AccountForm from '../components/AccountForm';
import useAccountById from '../hooks/use-account-by-Id';
import useUpdateAccount from '../hooks/use-update-account';
import Spinner from '../../../../../shared/ui/spinner';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';

const mapAccountToForm = (account) => ({
  accountID: account?.accountID,
  accountCode: account?.accountCode ?? '',
  nameAr: account?.nameAr ?? '',
  nameEn: account?.nameEn ?? '',
  parentId: account?.parentID ? String(account.parentID) : '',
  accountTypeId: account?.accountType ? String(account.accountType) : '',
  lockedInJournal: !!account?.lockedInJournal,
  isActive: account?.isActive ?? true,
});

const UpdateAccount = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: accountData, isPending, isError } = useAccountById(id);
  const { mutateAsync } = useUpdateAccount();

  const defaultValues = useMemo(
    () => (accountData ? mapAccountToForm(accountData) : {}),
    [accountData]
  );

  const handleUpdate = async (formData) => {
    await mutateAsync(
      {
        id,
        body: {
          accountID: formData.accountID,
          nameAr: formData.nameAr,
          nameEn: formData.nameEn,
          accountTypeId: formData.accountTypeId,
          lockedInJournal: formData.lockedInJournal,
          isActive: formData.isActive,
        },
      },
      { onSuccess: () => navigate('/accounts-tree') }
    );
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">جاري تحميل الحساب...</p>
      </div>
    );
  }

  if (isError || !accountData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-500">تعذر تحميل بيانات الحساب</p>
        <button
          type="button"
          onClick={() => navigate('/accounts-tree')}
          className="rounded-lg bg-primary px-4 py-2 text-white"
        >
          العودة لشجرة الحسابات
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'شجرة الحسابات', to: '/accounts-tree' },
              { label: 'تحديث الحساب' },
            ]}
          />
        </div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PencilLine size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">تحديث الحساب</h2>
            <p className="text-sm text-gray-500">
              يمكنك تعديل بيانات الحساب وحفظ التغييرات
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <AccountForm
            mode="update"
            defaultValues={defaultValues}
            onSubmit={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateAccount;
