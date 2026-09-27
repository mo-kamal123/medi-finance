import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '../../../../shared/ui/input';
import NormalSelect from '../../../../shared/ui/NormalSelect';
import PartySearchSelect from '../../../../shared/ui/party-search-select';
import TransferConfirmModal from './transfer-confirm-modal';
import { transferSchema } from '../validation/bank-transfer.validation';
import { useBankAccounts, useBanks } from '../hooks/banks.queries';
import { useCreateBankTransfer } from '../hooks/banks.mutations';

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const BankTransferForm = ({ bankId, onSuccess, onConfirmStageChange }) => {
  const navigate = useNavigate();
  const [, setTransferType] = useState('internal');
  const [partyType, setPartyType] = useState('customer');
  const [partyName, setPartyName] = useState('');
  const [toBankID, setToBankID] = useState('');
  const [confirmPayload, setConfirmPayload] = useState(null);

  const { mutate: createTransfer, isPending } = useCreateBankTransfer();

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
    () =>
      banks.map((b) => ({
        value: String(b.bankID),
        label: b.bankNameAr || b.bankNameEn || '',
      })),
    [banks]
  );

  const fromAccountOptions = useMemo(
    () =>
      fromAccounts.map((a) => ({
        value: String(a.bankAccountID),
        label: a.accountNumberWithBranch || a.accountNumber || '',
      })),
    [fromAccounts]
  );

  const toAccountOptions = useMemo(
    () =>
      toAccounts.map((a) => ({
        value: String(a.bankAccountID),
        label: a.accountNumberWithBranch || a.accountNumber || '',
      })),
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

    setConfirmPayload(payload);
    onConfirmStageChange?.(true);
  };

  const handleCancelConfirm = () => {
    setConfirmPayload(null);
    onConfirmStageChange?.(false);
  };

  const handleConfirm = () => {
    if (!confirmPayload) return;
    createTransfer(confirmPayload, {
      onSuccess: (data) => {
        const transferId = data?.bankTransferID ?? data?.id;
        reset();
        setTransferType('internal');
        setPartyType('customer');
        setPartyName('');
        setToBankID('');
        setConfirmPayload(null);
        onConfirmStageChange?.(false);
        if (onSuccess) {
          onSuccess(transferId);
        } else if (transferId) {
          navigate(`/banks/${bankId}/transfers?open=${transferId}`);
        }
      },
    });
  };

  const fromBankName = useMemo(() => {
    const bank = banks.find((b) => String(b.bankID) === String(bankId));
    return bank?.bankNameAr || bank?.bankNameEn || '';
  }, [banks, bankId]);

  const getAccountDisplay = (acc) => {
    if (!acc) return '';
    return (
      acc.accountNumberWithBranch ||
      [acc.accountNameAr || acc.accountNameEn, acc.accountNumber]
        .filter(Boolean)
        .join(' - ') ||
      `حساب ${acc.bankAccountID}`
    );
  };

  const fromInfo = useMemo(() => {
    const acc = fromAccounts.find(
      (a) =>
        confirmPayload &&
        String(a.bankAccountID) === String(confirmPayload.FromBankAccountID)
    );
    return {
      account:
        getAccountDisplay(acc) ||
        (confirmPayload ? `حساب ${confirmPayload.FromBankAccountID}` : ''),
      bank: fromBankName,
    };
  }, [confirmPayload, fromAccounts, fromBankName]);

  const toInfo = useMemo(() => {
    if (!confirmPayload) return { account: '', bank: '' };
    if (confirmPayload.transferType === 'internal') {
      const acc = toAccounts.find(
        (a) => String(a.bankAccountID) === String(confirmPayload.ToBankAccountID)
      );
      const bank = banks.find(
        (b) => String(b.bankID) === String(confirmPayload.tobankId)
      );
      return {
        account:
          getAccountDisplay(acc) || `حساب ${confirmPayload.ToBankAccountID}`,
        bank: bank?.bankNameAr || bank?.bankNameEn || '',
      };
    }
    return {
      account: partyName || '-',
      bank: confirmPayload.partyType === 'customer' ? 'عميل' : 'مورد',
    };
  }, [confirmPayload, toAccounts, banks, partyName]);

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              placeholder="اختر حساب المصدر"
            />
          )}
        />

        {watchedTransferType === 'internal' && (
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
                placeholder="اختر البنك"
              />
            )}
          />
        )}

        {watchedTransferType === 'internal' && (
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
                placeholder="اختر حساب الوجهة"
              />
            )}
          />
        )}

        {watchedTransferType === 'external' && (
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
                  setPartyName('');
                }}
                error={errors.partyType?.message}
                required
                options={partyTypeOptions}
              />
            )}
          />
        )}

        {watchedTransferType === 'external' && (
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
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setPartyName(e.target.entityName || '');
                  }}
                  error={errors.partyID?.message}
                />
              )}
            />
          </div>
        )}

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

      <TransferConfirmModal
        open={Boolean(confirmPayload)}
        isInternal={confirmPayload?.transferType === 'internal'}
        fromAccount={fromInfo.account}
        fromBank={fromInfo.bank}
        toAccount={toInfo.account}
        toBank={toInfo.bank}
        amount={confirmPayload?.amount ?? 0}
        notes={confirmPayload?.notes}
        onConfirm={handleConfirm}
        onClose={handleCancelConfirm}
        isPending={isPending}
      />
    </>
  );
};

export default BankTransferForm;
