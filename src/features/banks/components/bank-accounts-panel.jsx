import { useMemo, useState } from 'react';
import { Edit3, Plus, X } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import { useBankAccount, useBankAccounts } from '../hooks/banks.queries';
import { useSaveBankAccount } from '../hooks/banks.mutations';

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getAccountLabel = (account) =>
  account.accountNumberWithBranch ||
  account.accountNumber ||
  account.iban ||
  account.accountNameAr ||
  account.accountNameEn ||
  '-';

const getInitialValues = (account = {}, bankId = '') => ({
  bankAccountID: account.bankAccountID ?? '',
  accountNumber: account.accountNumber ?? '',
  branch: account.branch ?? '',
  iban: account.iban ?? '',
  bankID: account.bankID ?? Number(bankId),
  accountNameAr: account.accountNameAr ?? '',
  accountNameEn: account.accountNameEn ?? '',
  currencyID: account.currencyID ?? '',
  accountType: account.accountType ?? '',
  openingBalance: account.openingBalance ?? 0,
  minBalance: account.minBalance ?? 0,
  isActive: account.isActive ?? true,
  isDefault: account.isDefault ?? false,
});

const BankAccountForm = ({ account, bankId, isEditMode, onCancel, onSaved }) => {
  const [formData, setFormData] = useState(() => getInitialValues(account, bankId));
  const saveMutation = useSaveBankAccount(bankId);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...(formData.bankAccountID
        ? { bankAccountID: Number(formData.bankAccountID) }
        : {}),
      accountNumber: formData.accountNumber,
      branch: formData.branch || null,
      iban: formData.iban || null,
      bankID: Number(bankId),
      accountNameAr: formData.accountNameAr,
      accountNameEn: formData.accountNameEn || null,
      currencyID: Number(formData.currencyID) || 0,
      accountType: Number(formData.accountType) || 0,
      openingBalance: Number(formData.openingBalance) || 0,
      minBalance: Number(formData.minBalance) || 0,
      isActive: Boolean(formData.isActive),
      isDefault: Boolean(formData.isDefault),
      createdBy: 'ms',
    };

    saveMutation.mutate(payload, {
      onSuccess: onSaved,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditMode ? 'تعديل حساب البنك' : 'إضافة حساب بنك'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-gray-800"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FormInput
          label="رقم الحساب"
          value={formData.accountNumber}
          onChange={(e) => handleChange('accountNumber', e.target.value)}
        />
        <FormInput
          label="الفرع"
          value={formData.branch || ''}
          onChange={(e) => handleChange('branch', e.target.value)}
        />
        <FormInput
          label="IBAN"
          value={formData.iban || ''}
          onChange={(e) => handleChange('iban', e.target.value)}
        />
        <FormInput
          label="اسم الحساب بالعربية"
          value={formData.accountNameAr}
          onChange={(e) => handleChange('accountNameAr', e.target.value)}
        />
        <FormInput
          label="اسم الحساب بالإنجليزية"
          value={formData.accountNameEn || ''}
          onChange={(e) => handleChange('accountNameEn', e.target.value)}
        />
        <FormInput
          type="number"
          label="رقم العملة"
          value={formData.currencyID}
          onChange={(e) => handleChange('currencyID', e.target.value)}
        />
        <FormInput
          type="number"
          label="نوع الحساب"
          value={formData.accountType}
          onChange={(e) => handleChange('accountType', e.target.value)}
        />
        <FormInput
          type="number"
          label="الرصيد الافتتاحي"
          value={formData.openingBalance}
          onChange={(e) => handleChange('openingBalance', e.target.value)}
        />
        <FormInput
          type="number"
          label="الحد الأدنى للرصيد"
          value={formData.minBalance}
          onChange={(e) => handleChange('minBalance', e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
          />
          <span>نشط</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => handleChange('isDefault', e.target.checked)}
          />
          <span>افتراضي</span>
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-white"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ الحساب'}
        </button>
      </div>
    </form>
  );
};

const BankAccountsPanel = ({ bankId }) => {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: accountsResponse, isLoading } = useBankAccounts(bankId);
  const { data: accountDetails, isFetching: isLoadingAccount } =
    useBankAccount(selectedAccountId);
  const accounts = useMemo(
    () => normalizeCollection(accountsResponse),
    [accountsResponse]
  );

  const openCreateForm = () => {
    setSelectedAccountId('');
    setIsFormOpen(true);
  };

  const openEditForm = (accountId) => {
    setSelectedAccountId(String(accountId));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedAccountId('');
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">حسابات البنك</h2>
          <p className="mt-1 text-sm text-gray-500">
            الحسابات المرتبطة بهذا البنك
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          إضافة حساب
        </button>
      </div>

      {isLoading ? (
        <PageLoader label="جاري تحميل حسابات البنك..." className="min-h-[160px]" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-primary/90 text-white">
              <tr>
                <th className="p-3 text-right font-semibold">رقم الحساب</th>
                <th className="p-3 text-right font-semibold">اسم الحساب</th>
                <th className="p-3 text-right font-semibold">العملة</th>
                <th className="p-3 text-right font-semibold">الرصيد الحالي</th>
                <th className="p-3 text-right font-semibold">الحالة</th>
                <th className="p-3 text-right font-semibold">تعديل</th>
              </tr>
            </thead>
            <tbody>
  {accounts.length > 0 ? (
    accounts.map((account) => {
      const isExpanded =
        isFormOpen &&
        selectedAccountId === String(account.bankAccountID);

      return (
        <>
          <tr
            key={account.bankAccountID}
            className="border-t border-gray-200 even:bg-gray-50/50"
          >
            <td className="p-3">{getAccountLabel(account)}</td>

            <td className="p-3">
              {account.accountNameAr || account.accountNameEn || '-'}
            </td>

            <td className="p-3">
              {account.currencyNameAr ||
                account.currencyNameEn ||
                account.currencyCode ||
                '-'}
            </td>

            <td className="p-3">
              {account.currentBalance ?? '-'}
            </td>

            <td className="p-3">
              {account.isActive ? 'نشط' : 'غير نشط'}
            </td>

            <td className="p-3">
              <button
                type="button"
                onClick={() => {
                  if (isExpanded) {
                    closeForm();
                  } else {
                    openEditForm(account.bankAccountID);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-primary hover:bg-gray-50"
              >
                <Edit3 size={16} />
                {isExpanded ? 'إغلاق' : 'تعديل'}
              </button>
            </td>
          </tr>

          {isExpanded && (
            <tr className="border-t border-gray-200 bg-gray-50">
              <td colSpan={6} className="p-4">
                {isLoadingAccount ? (
                  <PageLoader
                    label="جاري تحميل بيانات الحساب..."
                    className="min-h-[120px]"
                  />
                ) : (
                  <BankAccountForm
                    key={selectedAccountId}
                    account={accountDetails || {}}
                    bankId={bankId}
                    isEditMode
                    onCancel={closeForm}
                    onSaved={closeForm}
                  />
                )}
              </td>
            </tr>
          )}
        </>
      );
    })
  ) : (
    <tr>
      <td colSpan={6} className="p-6 text-center text-gray-400">
        لا توجد حسابات لهذا البنك
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      )}

      {/* {isFormOpen ? (
        isLoadingAccount ? (
          <PageLoader label="جاري تحميل بيانات الحساب..." className="min-h-[120px]" />
        ) : (
          <BankAccountForm
            key={selectedAccountId || 'new'}
            account={selectedAccountId ? accountDetails : {}}
            bankId={bankId}
            isEditMode={Boolean(selectedAccountId)}
            onCancel={closeForm}
            onSaved={closeForm}
          />
        )
      ) : null} */}
    </section>
  );
};

export default BankAccountsPanel;
