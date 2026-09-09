// Invoice payment modal UI.

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

// -- UI primitives
import FormInput from '../../../../../shared/ui/input';
import DateInput from '../../../../../shared/ui/date-input';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import AccountSearchSelect from '../../../entries/components/account-search-select';

// -- Domain logic
import { useBanks, useAllBankAccounts } from '../../../../banking/banks/hooks/banks.queries';
import { payInvoice } from '../api/invoices-api';
import { invoicesKeys } from '../hooks/invoices.keys';
import {
  PAYMENT_MODE_OPTIONS,
  payInvoiceSchema,
  normalizeCollection,
  buildPaymentPayload,
  buildBankOptions,
  buildBankAccountOptions,
  buildAllBankAccountOptions,
  filterBankAccounts,
} from '../utils/pay-invoice-utils';

// PayInvoiceModal
const PayInvoiceModal = ({ invoiceId, remainingAmount, isOpen, onClose, onSuccess }) => {
  // Cache & data fetching
  const queryClient = useQueryClient();
  const { data: banksResponse = [] } = useBanks();
  const { data: allBankAccountsRes = [] } = useAllBankAccounts();

  const today = new Date().toISOString().split('T')[0];

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
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

  // Mutation
  const payMutation = useMutation({
    mutationFn: (payload) => payInvoice({ id: invoiceId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
      onSuccess?.();
      onClose();
    },
  });

  // Derived option lists
  const banks = useMemo(() => normalizeCollection(banksResponse), [banksResponse]);
  const allBankAccounts = useMemo(() => normalizeCollection(allBankAccountsRes), [allBankAccountsRes]);

  const bankAccounts = useMemo(
    () => filterBankAccounts(allBankAccounts, watchedBankID, watchedPaymentMode),
    [allBankAccounts, watchedBankID, watchedPaymentMode],
  );

  const bankOptions = useMemo(() => buildBankOptions(banks), [banks]);
  const allBankAccountOptions = useMemo(() => buildAllBankAccountOptions(allBankAccounts), [allBankAccounts]);
  const bankAccountOptions = useMemo(() => buildBankAccountOptions(bankAccounts), [bankAccounts]);

  // Submit handler
  const onSubmit = (data) => {
    payMutation.mutate(buildPaymentPayload(data));
  };

  // Don't render when closed
  if (!isOpen) return null;

  // JSX
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-right shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">دفع الفاتورة</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Common fields */}
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

          {/* Check (شيك) fields */}
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

          {/* Cash (نقدي) fields */}
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

          {/* Bank transfer (تحويل بنكي) fields */}
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

          {/* Actions */}
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
