import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { z } from 'zod';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import AccountSearchSelect from '../../entries/components/account-search-select';
import { useBanks, useAllBankAccounts } from '../../../banking/banks/hooks/banks.queries';
import { payInvoice } from '../api/invoices-api';
import { invoicesKeys } from '../hooks/invoices.keys';

const PAYMENT_MODE_OPTIONS = [
  { value: '1', label: 'شيك' },
  { value: '2', label: 'نقدي' },
  { value: '3', label: 'تحويل بنكي' },
];

const payInvoiceSchema = z
  .object({
    paymentMode: z.string().min(1, 'طريقة الدفع مطلوبة'),
    amount: z
      .union([z.string(), z.number()])
      .refine(
        (value) =>
          value !== '' &&
          value !== null &&
          value !== undefined &&
          !Number.isNaN(Number(value)) &&
          Number(value) > 0,
        'المبلغ مطلوب'
      ),
    paymentDate: z.string().min(1, 'تاريخ الدفع مطلوب'),
    referenceNumber: z.string().optional().default(''),
    bankID: z.string().optional().default(''),
    bankAccountID: z.string().optional().default(''),
    accountID: z.string().optional().default(''),
    checkNumber: z.string().optional().default(''),
    fromBankAccountID: z.string().optional().default(''),
    toBankAccountID: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMode === '1') {
      if (!data.bankID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankID'], message: 'البنك مطلوب' });
      }
      if (!data.bankAccountID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankAccountID'], message: 'حساب البنك مطلوب' });
      }
      if (!data.checkNumber) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['checkNumber'], message: 'رقم الشيك مطلوب' });
      }
    }
    if (data.paymentMode === '2' && !data.accountID) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['accountID'], message: 'الحساب مطلوب' });
    }
    if (data.paymentMode === '3') {
      if (!data.fromBankAccountID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fromBankAccountID'], message: 'من حساب مطلوب' });
      }
      if (!data.toBankAccountID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['toBankAccountID'], message: 'إلى حساب مطلوب' });
      }
    }
  });

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const PayInvoiceModal = ({ invoiceId, remainingAmount, isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const { data: banksResponse = [] } = useBanks();
  const { data: allBankAccountsRes = [] } = useAllBankAccounts();

  const today = new Date().toISOString().split('T')[0];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paymentMode: '2',
      amount: remainingAmount ?? '',
      paymentDate: today,
      referenceNumber: '',
      bankID: '',
      bankAccountID: '',
      accountID: '',
      checkNumber: '',
      fromBankAccountID: '',
      toBankAccountID: '',
    },
    resolver: zodResolver(payInvoiceSchema),
  });

  const watchedPaymentMode = watch('paymentMode');
  const watchedBankID = watch('bankID');

  const payMutation = useMutation({
    mutationFn: (payload) => payInvoice({ id: invoiceId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
      onSuccess?.();
      onClose();
    },
  });

  const banks = useMemo(() => normalizeCollection(banksResponse), [banksResponse]);
  const allBankAccounts = useMemo(() => normalizeCollection(allBankAccountsRes), [allBankAccountsRes]);

  const bankAccounts = useMemo(
    () =>
      watchedPaymentMode === '1' && watchedBankID
        ? allBankAccounts.filter(
            (acc) => String(acc.bankID) === String(watchedBankID)
          )
        : [],
    [allBankAccounts, watchedBankID, watchedPaymentMode]
  );

  const bankOptions = useMemo(
    () =>
      banks.map((bank) => ({
        value: String(bank.bankID),
        label: bank.bankNameAr || bank.bankNameEn || bank.bankCode,
      })),
    [banks]
  );

  const allBankAccountOptions = useMemo(
    () =>
      allBankAccounts.map((account) => ({
        value: String(account.bankAccountID || account.id),
        label: `${
          account.accountNumberWithBranch ||
          account.accountNumber ||
          account.iban ||
          account.accountNameAr ||
          account.accountNameEn ||
          String(account.bankAccountID || account.id)
        } - ${account.bankNameAr || account.bankNameEn || ''}`,
      })),
    [allBankAccounts]
  );

  const bankAccountOptions = useMemo(
    () =>
      bankAccounts.map((account) => ({
        value: String(account.bankAccountID || account.id),
        label:
          account.accountNumberWithBranch ||
          account.accountNumber ||
          account.iban ||
          account.accountNameAr ||
          account.accountNameEn ||
          String(account.bankAccountID || account.id),
      })),
    [bankAccounts]
  );

  const onSubmit = (data) => {
    const payload = {
      amount: Number(data.amount),
      paymentMode:
        data.paymentMode === '1'
          ? 'Check'
          : data.paymentMode === '2'
            ? 'Cash'
            : 'BankTransfer',
      paymentDate: `${data.paymentDate}T00:00:00`,
      referenceNumber: data.referenceNumber || null,
      bankID: data.paymentMode === '1' ? Number(data.bankID) : null,
      bankAccountID:
        data.paymentMode === '1' ? Number(data.bankAccountID) : null,
      accountID: data.paymentMode === '2' ? Number(data.accountID) : null,
      checkNumber: data.paymentMode === '1' ? data.checkNumber : null,
      fromBankAccountID:
        data.paymentMode === '3' ? Number(data.fromBankAccountID) : null,
      toBankAccountID:
        data.paymentMode === '3' ? Number(data.toBankAccountID) : null,
    };
    payMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-right shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">دفع الفاتورة</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="paymentMode"
              control={control}
              render={({ field }) => (
                <FormInput
                  as="select"
                  label="طريقة الدفع"
                  value={field.value ?? '2'}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setValue('bankID', '');
                    setValue('bankAccountID', '');
                    setValue('checkNumber', '');
                    setValue('fromBankAccountID', '');
                    setValue('toBankAccountID', '');
                  }}
                  required
                >
                  {PAYMENT_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormInput>
              )}
            />

            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <FormInput
                  type="number"
                  label="المبلغ"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.amount?.message}
                  required
                />
              )}
            />

            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="تاريخ الدفع"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                  error={errors.paymentDate?.message}
                  required
                />
              )}
            />

            <Controller
              name="referenceNumber"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="رقم المرجع"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {watchedPaymentMode === '1' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Controller
                name="bankID"
                control={control}
                render={({ field }) => (
                  <FormInput
                    as="select"
                    label="البنك"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setValue('bankAccountID', '');
                    }}
                    error={errors.bankID?.message}
                    required
                  >
                    <option value="">اختر البنك</option>
                    {bankOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </FormInput>
                )}
              />

              <Controller
                name="bankAccountID"
                control={control}
                render={({ field }) => (
                  <FormInput
                    as="select"
                    label="حساب البنك"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={!watchedBankID}
                    error={errors.bankAccountID?.message}
                    required
                  >
                    <option value="">اختر حساب البنك</option>
                    {bankAccountOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </FormInput>
                )}
              />

              <Controller
                name="checkNumber"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="رقم الشيك"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={errors.checkNumber?.message}
                    required
                  />
                )}
              />
            </div>
          ) : null}

          {watchedPaymentMode === '2' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <Controller
                name="accountID"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">الحساب</label>
                    <AccountSearchSelect
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      error={errors.accountID?.message}
                    />
                  </div>
                )}
              />
            </div>
          ) : null}

          {watchedPaymentMode === '3' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="fromBankAccountID"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    options={allBankAccountOptions}
                    placeholder="اختر الحساب المحول منه"
                    label="من حساب"
                    error={errors.fromBankAccountID?.message}
                  />
                )}
              />

              <Controller
                name="toBankAccountID"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    options={allBankAccountOptions}
                    placeholder="اختر الحساب المحول إليه"
                    label="إلى حساب"
                    error={errors.toBankAccountID?.message}
                  />
                )}
              />
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={payMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {payMutation.isPending ? 'جاري الدفع...' : 'دفع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayInvoiceModal;