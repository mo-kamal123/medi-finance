import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '../../../../shared/ui/input';
import NormalSelect from '../../../../shared/ui/NormalSelect';
import PartySearchSelect from '../../../../shared/ui/party-search-select';
import { useBankAccounts, useBanks } from '../hooks/banks.queries';
import { useCreateBankTransfer } from '../hooks/banks.mutations';

const transferSchema = z.object({
  transferType: z.enum(['internal', 'external'], {
    required_error: 'نوع التحويل مطلوب',
  }),
  fromAccountID: z.string().min(1, 'حساب المصدر مطلوب'),
  toBankID: z.string().optional(),
  toAccountID: z.string().optional(),
  partyType: z.enum(['customer', 'supplier']).optional(),
  partyID: z.string().optional(),
  amount: z
    .union([z.string(), z.number()])
    .refine((val) => Number(val) > 0, 'المبلغ يجب أن يكون أكبر من صفر'),
  notes: z.string().optional(),
});

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const BankTransferForm = ({ bankId }) => {
  const [transferType, setTransferType] = useState('internal');
  const [partyType, setPartyType] = useState('customer');
  const [toBankID, setToBankID] = useState('');

  const { mutate: createTransfer, isPending } = useCreateBankTransfer(bankId);

  const { data: banks = [] } = useBanks({ pageSize: 100 });
  const { data: fromAccountsResponse, isLoading: loadingFromAccounts } =
    useBankAccounts(bankId);
  const { data: toAccountsResponse, isLoading: loadingToAccounts } =
    useBankAccounts(toBankID);

  const fromAccounts = useMemo(
    () => normalizeCollection(fromAccountsResponse),
    [fromAccountsResponse]
  );

  const toAccounts = useMemo(
    () => normalizeCollection(toAccountsResponse),
    [toAccountsResponse]
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transferType: 'internal',
      fromAccountID: '',
      toBankID: '',
      toAccountID: '',
      partyType: 'customer',
      partyID: '',
      amount: '',
      notes: '',
    },
  });

  const watchedTransferType = watch('transferType');

  const bankOptions = useMemo(
    () => [
      { value: '', label: 'اختر البنك' },
      ...banks.map((b) => ({
        value: String(b.bankID),
        label: b.bankNameAr || b.bankNameEn || '',
      })),
    ],
    [banks]
  );

  const fromAccountOptions = useMemo(
    () => [
      { value: '', label: 'اختر حساب المصدر' },
      ...fromAccounts.map((a) => ({
        value: String(a.bankAccountID),
        label: `${a.accountNumber || ''} - ${a.accountNameAr || a.accountNameEn || ''}`.trim(),
      })),
    ],
    [fromAccounts]
  );

  const toAccountOptions = useMemo(
    () => [
      { value: '', label: 'اختر حساب الوجهة' },
      ...toAccounts.map((a) => ({
        value: String(a.bankAccountID),
        label: `${a.accountNumber || ''} - ${a.accountNameAr || a.accountNameEn || ''}`.trim(),
      })),
    ],
    [toAccounts]
  );

  const transferTypeOptions = [
    { value: 'internal', label: 'تحويل داخلي' },
    { value: 'external', label: 'تحويل خارجي' },
  ];

  const partyTypeOptions = [
    { value: 'customer', label: 'عميل' },
    { value: 'supplier', label: 'مورد' },
  ];

  const handleFormSubmit = (data) => {
    const payload = {
      frombankId: String(bankId),
      transferType: data.transferType,
      FromBankAccountID: Number(data.fromAccountID),
      amount: Number(data.amount),
      notes: data.notes || '',
    };

    if (data.transferType === 'internal') {
      payload.tobankId = String(data.toBankID);
      payload.ToBankAccountID = Number(data.toAccountID);
    } else {
      payload.partyType = data.partyType;
      payload.partyID = Number(data.partyID);
    }

    createTransfer(payload, {
      onSuccess: () => {
        reset();
        setTransferType('internal');
        setPartyType('customer');
        setToBankID('');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Controller
          name="transferType"
          control={control}
          render={({ field }) => (
            <NormalSelect
              label="نوع التحويل"
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value);
                setTransferType(e.target.value);
              }}
              error={errors.transferType?.message}
              required
              options={transferTypeOptions}
            />
          )}
        />

        <Controller
          name="fromAccountID"
          control={control}
          render={({ field }) => (
            <NormalSelect
              label="حساب المصدر"
              value={field.value}
              onChange={field.onChange}
              error={errors.fromAccountID?.message}
              required
              options={fromAccountOptions}
              disabled={loadingFromAccounts}
            />
          )}
        />

        {watchedTransferType === 'internal' && (
          <>
            <Controller
              name="toBankID"
              control={control}
              render={({ field }) => (
                <NormalSelect
                  label="البنك الوجهة"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setToBankID(e.target.value);
                  }}
                  error={errors.toBankID?.message}
                  required
                  options={bankOptions}
                />
              )}
            />
          </>
        )}
      </div>

      {watchedTransferType === 'internal' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Controller
            name="toAccountID"
            control={control}
            render={({ field }) => (
              <NormalSelect
                label="حساب الوجهة"
                value={field.value}
                onChange={field.onChange}
                error={errors.toAccountID?.message}
                required
                options={toAccountOptions}
                disabled={!toBankID || loadingToAccounts}
              />
            )}
          />
        </div>
      )}

      {watchedTransferType === 'external' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Controller
            name="partyType"
            control={control}
            render={({ field }) => (
              <NormalSelect
                label="نوع الطرف"
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setPartyType(e.target.value);
                }}
                error={errors.partyType?.message}
                required
                options={partyTypeOptions}
              />
            )}
          />

          <div>
            <label className="mb-1 block font-medium text-gray-700 text-[15px]">
              {partyType === 'customer' ? 'العميل' : 'المورد'} <span className="text-red-500 mr-1">*</span>
            </label>
            <Controller
              name="partyID"
              control={control}
              render={({ field }) => (
                <PartySearchSelect
                  type={partyType}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={errors.partyID?.message}
                />
              )}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <FormInput
              type="number"
              label="المبلغ"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={errors.amount?.message}
              required
            />
          )}
        />
      </div>

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <FormInput
            as="textarea"
            label="ملاحظات"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder="أدخل ملاحظات التحويل"
          />
        )}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-8 py-2 text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'جاري التنفيذ...' : 'تنفيذ التحويل'}
        </button>
      </div>
    </form>
  );
};

export default BankTransferForm;
