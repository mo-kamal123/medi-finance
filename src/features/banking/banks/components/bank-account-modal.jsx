import { useEffect, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import Toggle from '../../../../shared/ui/toggle';
import { useCurrencies } from '../../../transactions/commercial-papers/hooks/commercial-papers.queries';
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
  ...(isEditMode ? {} : { openingBalance: account.openingBalance ?? '' }),
  minBalance: account.minBalance ?? '',
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
    trigger,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: formDefaults,
    values: formDefaults,
    resolver: zodResolver(bankAccountSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  // Same blur (unfocus) validation pattern as bank-form:
  // validate the field as soon as the user leaves it.
  const registerBlur = (name) => {
    const { onBlur: rhfOnBlur, ...rest } = register(name);
    return {
      ...rest,
      onBlur: async (e) => {
        await rhfOnBlur(e);
        trigger(name);
      },
    };
  };

  // Account number: numbers only — strip non-digits on type/paste,
  // then validate on blur.
  const {
    onChange: accountNumberOnChange,
    onBlur: accountNumberOnBlur,
    ...accountNumberRest
  } = register('accountNumber');

  const isActive = useWatch({ control, name: 'isActive' });

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
      isDefault: Boolean(data.isActive) && Boolean(data.isDefault),
    };

    if (isEditMode) {
      updateMutation.mutate({ id: account.bankAccountID, ...payload }, { onSuccess: onSaved });
    } else {
      createMutation.mutate(payload, { onSuccess: onSaved });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 text-right max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'تعديل حساب البنك' : 'إضافة حساب بنك'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="رقم الحساب"
              placeholder="مثال: 123456789"
              inputMode="numeric"
              {...accountNumberRest}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                accountNumberOnChange(e);
              }}
              onBlur={async (e) => {
                await accountNumberOnBlur(e);
                trigger('accountNumber');
              }}
              error={errors.accountNumber?.message}
              required
            />

            <FormInput
              label="الفرع"
              placeholder="مثال: فرع وسط البلد"
              {...registerBlur('branch')}
              error={errors.branch?.message}
              required
            />
            <Controller
              name="currencyID"
              control={control}
              render={({ field }) => (
                <FormInput
                  as="select"
                  label="العملة"
                  placeholder="اختر العملة"
                  error={errors.currencyID?.message}
                  name={field.name}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    trigger('currencyID');
                  }}
                  onBlur={() => {
                    field.onBlur?.();
                    trigger('currencyID');
                  }}
                  required
                >
                  {currencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </FormInput>
              )}
            />
            <FormInput
              label="IBAN"
              placeholder="مثال: EG380019000500000000263180002"
              {...registerBlur('iban')}
              error={errors.iban?.message}
            />

            {isEditMode && (
              <>
                <FormInput
                  label="اسم الحساب بالعربية"
                  placeholder="مثال: الحساب الجاري"
                  {...registerBlur('accountNameAr')}
                  error={errors.accountNameAr?.message}
                />
                <FormInput
                  label="اسم الحساب بالإنجليزية"
                  placeholder="مثال: Current Account"
                  {...registerBlur('accountNameEn')}
                  error={errors.accountNameEn?.message}
                />
              </>
            )}

            {!isEditMode && (
              <FormInput
                type="number"
                min="0"
                label="الرصيد الافتتاحي"
                placeholder="مثال: 1000"
                {...registerBlur('openingBalance')}
                error={errors.openingBalance?.message}
              />
            )}

            <FormInput
              type="number"
              min="0"
              label="الحد الأدنى للرصيد"
              placeholder="مثال: 500"
              {...registerBlur('minBalance')}
              error={errors.minBalance?.message}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <Toggle label="نشط" {...register('isActive')} />
            <Toggle
              label="افتراضي"
              disabled={!isActive}
              {...register('isDefault')}
            />
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
              {isSubmitting || mutation.isPending
                ? 'جاري الحفظ...'
                : isEditMode
                  ? 'تحديث الحساب'
                  : 'حفظ الحساب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountModal;
