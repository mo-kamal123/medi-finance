import { useMemo, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import PageLoader from '../../../../shared/ui/page-loader';
import ConfirmModal from '../../../../shared/ui/modal';
import BankAccountModal from './bank-account-modal';
import { useBankAccount, useBankAccounts } from '../hooks/banks.queries';
import { useDeleteBankAccount } from '../hooks/banks.mutations';

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const BankAccountsPanel = ({ bankId }) => {
  const [modalMode, setModalMode] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: accountsResponse, isLoading } = useBankAccounts(bankId);
  const { data: accountDetails } =
    useBankAccount(selectedAccountId);
  const { mutate: deleteBankAccount } = useDeleteBankAccount(bankId);

  const accounts = useMemo(
    () => normalizeCollection(accountsResponse),
    [accountsResponse]
  );

  const openCreateModal = () => {
    setSelectedAccountId('');
    setModalMode('create');
  };

  const openEditModal = (accountId) => {
    setSelectedAccountId(String(accountId));
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
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
          onClick={openCreateModal}
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
                <th className="p-3 text-center font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <tr
                    key={account.bankAccountID}
                    className="border-t border-gray-200 even:bg-gray-50/50"
                  >
                    <td className="p-3">{account.accountNumber || '-'}</td>
                    <td className="p-3">
                      {account.accountNumberWithBranch || account.accountNameAr || account.accountNameEn || '-'}
                    </td>
                    <td className="p-3">
                      {account.currencyNameAr ||
                        account.currencyNameEn ||
                        account.currencyCode ||
                        '-'}
                    </td>
                    <td className="p-3">{account.currentBalance ?? '-'}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        account.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {account.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(account.bankAccountID)}
                          className="text-blue-600 hover:text-blue-800"
                          title="تعديل"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(account)}
                          className="text-red-500 hover:text-red-700"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      <BankAccountModal
        account={modalMode === 'edit' ? accountDetails || {} : {}}
        bankId={bankId}
        isOpen={modalMode !== null}
        isEditMode={modalMode === 'edit'}
        onClose={closeModal}
        onSaved={closeModal}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            setIsDeleting(true);
            deleteBankAccount(deleteTarget.bankAccountID, {
              onSettled: () => setIsDeleting(false),
            });
          }
          setDeleteTarget(null);
        }}
        isLoading={isDeleting}
        loadingText="جاري الحذف..."
        title="تأكيد حذف الحساب"
        description={`هل أنت متأكد من حذف الحساب "${deleteTarget?.accountNumber}"؟`}
        confirmText="نعم، حذف"
        cancelText="إلغاء"
      />
    </section>
  );
};

export default BankAccountsPanel;
