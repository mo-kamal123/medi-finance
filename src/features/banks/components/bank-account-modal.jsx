import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import { useCurrencies } from '../../commercial-papers/hooks/commercial-papers.queries';
import { useCreateBankAccount, useUpdateBankAccount } from '../hooks/banks.mutations';
import { bankAccountSchema } from '../validation/bank-account.validation';

const getInitialValues = (account = {}, isEditMode) => ({
  accountNumber: account.accountNumber ?? '',
  branch: account.branch ?? '',
  iban: account.iban ?? '',
  ...(isEditMode ? {
    accountNameAr: account.accountNameAr ?? '',
    accountNameEn: account.accountNameEn ?? '',
  } : {}),
  currencyID: account.currencyID ? String(account.currencyID) : '',
  ...(isEditMode ? {} : { openingBalance: account.openingBalance ?? 0 }),
  minBalance: account.minBalance ?? 0,
  isActive: account.isActive ?? true,
  isDefault: account.isDefault ?? false,
});

const BankAccountModal = ({ account, bankId, isOpen, isEditMode, onClose, onSaved }) => {
  const { data: currencies = [] } = useCurrencies();
  const createMutation = useCreateBankAccount(bankId);
  const updateMutation = useUpdateBankAccount(bankId);
  const mutation = isEditMode ? updateMutation : createMutation;

  const formDefaults = useMemo(
    () => getInitialValues(account, isEditMode),
    [account, isEditMode]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: formDefaults,
    values: formDefaults,
    resolver: zodResolver(bankAccountSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const currencyOptions = useMemo(
    () =>
      currencies.map((item) => ({
        value: String(item.currencyID),
        label: item.currencyNameAr || item.currencyNameEn || item.currencyCode,
      })),
    [currencies]
  );

  const onSubmit = (data) => {
    const payload = {
      accountNumber: data.accountNumber,
      branch: data.branch || '',
      iban: data.iban || '',
      bankID: Number(bankId),
      ...(isEditMode ? {
        accountNameAr: data.accountNameAr || '',
        accountNameEn: data.accountNameEn || '',
        accountID: account?.accountID ?? 0,
      } : {
        openingBalance: Number(data.openingBalance) || 0,
      }),
      currencyID: Number(data.currencyID),
      minBalance: Number(data.minBalance) || 0,
      isActive: Boolean(data.isActive),
      isDefault: Boolean(data.isDefault),
    };

    if (isEditMode) {
      updateMutation.mutate({ id: account.bankAccountID, ...payload }, { onSuccess: onSaved });
    } else {
      createMutation.mutate(payload, { onSuccess: onSaved });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 text-right max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'تعديل حساب البنك' : 'إضافة حساب بنك'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="رقم الحساب"
              {...register('accountNumber')}
              error={errors.accountNumber?.message}
              required
            />

            <FormInput
              label="الفرع"
              {...register('branch')}
              error={errors.branch?.message}
            />

            <FormInput
              label="IBAN"
              {...register('iban')}
              error={errors.iban?.message}
            />

            {isEditMode && (
              <>
                <FormInput
                  label="اسم الحساب بالعربية"
                  {...register('accountNameAr')}
                  error={errors.accountNameAr?.message}
                />
                <FormInput
                  label="اسم الحساب بالإنجليزية"
                  {...register('accountNameEn')}
                  error={errors.accountNameEn?.message}
                />
              </>
            )}

            <Controller
              name="currencyID"
              control={control}
              render={({ field }) => (
                <FormInput
                  as="select"
                  label="العملة"
                  error={errors.currencyID?.message}
                  value={field.value}
                  onChange={field.onChange}
                  required
                >
                  <option value="">اختر العملة</option>
                  {currencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </FormInput>
              )}
            />

            {!isEditMode && (
              <FormInput
                type="number"
                label="الرصيد الافتتاحي"
                {...register('openingBalance')}
                error={errors.openingBalance?.message}
              />
            )}

            <FormInput
              type="number"
              label="الحد الأدنى للرصيد"
              {...register('minBalance')}
              error={errors.minBalance?.message}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input type="checkbox" {...register('isActive')} />
              <span>نشط</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input type="checkbox" {...register('isDefault')} />
              <span>افتراضي</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting || mutation.isPending ? 'جاري الحفظ...' : isEditMode ? 'تحديث الحساب' : 'حفظ الحساب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountModal;
