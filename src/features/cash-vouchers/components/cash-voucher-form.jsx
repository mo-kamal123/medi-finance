import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DateInput from '../../../shared/ui/date-input';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import { getErrorMessage, toast } from '../../../shared/lib/toast';
import { useCustomers, useSuppliers } from '../../invoices/hooks/invoices.queries';
import { useBanks, useBankAccounts } from '../../banks/hooks/banks.queries';
import useCostTree from '../../tree/cost-tree/hooks/use-cost-tree';
import { getInvoiceForCashVoucher } from '../api/cash-vouchers.api';
import {
  useCreateCashVoucher,
  useUpdateCashVoucher,
} from '../hooks/cash-vouchers.mutations';
import {
  buildCashVoucherPayload,
  mapCashVoucherToFormValues,
} from '../utils/mapCashVoucherValues';
import { cashVoucherSchema } from '../validation/cash-voucher.validation';

const getFinalNodes = (nodes = []) => {
  let finalNodes = [];

  nodes.forEach((node) => {
    if (node.isFinal) {
      finalNodes.push(node);
    }

    if (node.children?.length) {
      finalNodes = finalNodes.concat(getFinalNodes(node.children));
    }
  });

  return finalNodes;
};

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getDefaultFormValues = (defaultValues) => {
  const mapped = mapCashVoucherToFormValues(defaultValues || {});

  return {
    isReceipt: mapped.isReceipt,
    date: mapped.date || '',
    bankId: mapped.bankId || '',
    bankAccountId: mapped.bankAccountId || '',
    checkNumber: mapped.checkNumber || '',
    costCenterId: mapped.costCenterId || '',
    invoiceNumber: mapped.invoiceNumber || '',
    details:
      mapped.details?.length > 0
        ? mapped.details
        : [{ partyID: '', partyName: '', amount: '', notes: '' }],
  };
};

const voucherTypeOptions = [
  { value: 'receipt', label: 'سند قبض' },
  { value: 'payment', label: 'سند صرف' },
];

const CashVoucherForm = ({ defaultValues, mode = 'create' }) => {
  const navigate = useNavigate();
  const createMutation = useCreateCashVoucher();
  const updateMutation = useUpdateCashVoucher();
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  const { data: banksResponse = [] } = useBanks();
  const { data: customers = [] } = useCustomers();
  const { data: suppliers = [] } = useSuppliers();
  const { data: costTree = [] } = useCostTree();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: getDefaultFormValues(defaultValues),
    resolver: zodResolver(cashVoucherSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  const watchedIsReceipt = useWatch({ control, name: 'isReceipt' });
  const watchedDetails = useWatch({ control, name: 'details' });
  const watchedBankId = useWatch({ control, name: 'bankId' });
  const watchedBankAccountId = useWatch({ control, name: 'bankAccountId' });
  const watchedInvoiceNumber = useWatch({ control, name: 'invoiceNumber' });

  const [invoicePreview, setInvoicePreview] = useState(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      reset(getDefaultFormValues(defaultValues));
    }
  }, [defaultValues, reset]);

  const { data: bankAccountsData = [] } = useBankAccounts(watchedBankId);
  const bankAccounts = useMemo(
    () => normalizeCollection(bankAccountsData),
    [bankAccountsData]
  );

  const banks = useMemo(
    () => normalizeCollection(banksResponse),
    [banksResponse]
  );

  const costCenterOptions = useMemo(
    () =>
      getFinalNodes(costTree).map((center) => ({
        value: String(center.costCenterID),
        label: `${center.costCenterCode || center.code || ''} - ${center.nameAr || center.nameEn || ''}`,
      })),
    [costTree]
  );

  const bankOptions = useMemo(
    () =>
      banks.map((bank) => ({
        value: String(bank.bankID),
        label: bank.bankNameAr || bank.bankNameEn || bank.bankCode,
      })),
    [banks]
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

  const partySource = watchedIsReceipt !== false ? customers : suppliers;

  const partyOptions = useMemo(
    () =>
      partySource.map((party) => ({
        value: String(
          watchedIsReceipt !== false ? party.customerID : party.supplierID
        ),
        label:
          (watchedIsReceipt !== false
            ? party.customerNameAr || party.customerNameEn
            : party.supplierNameAr || party.supplierNameEn) || '',
      })),
    [partySource, watchedIsReceipt]
  );

  const watchedFirstDetail = watchedDetails?.[0];

  const partyOptionsWithCurrent = useMemo(() => {
    if (!watchedFirstDetail?.partyName) {
      return partyOptions;
    }

    const hasMatch = partyOptions.some(
      (option) =>
        option.value === String(watchedFirstDetail.partyID || '') ||
        option.label === watchedFirstDetail.partyName
    );

    if (hasMatch) {
      return partyOptions;
    }

    return [
      {
        value: String(
          watchedFirstDetail.partyID || watchedFirstDetail.partyName
        ),
        label: watchedFirstDetail.partyName,
      },
      ...partyOptions,
    ];
  }, [watchedFirstDetail, partyOptions]);

  const handleInvoiceLookup = useCallback(async () => {
    const invoiceId = String(watchedInvoiceNumber || '').trim();

    if (!invoiceId) {
      toast.error('أدخل رقم الفاتورة أولاً');
      return;
    }

    setIsLoadingInvoice(true);

    try {
      const invoice = await getInvoiceForCashVoucher(invoiceId);

      if (!invoice || invoice.error) {
        toast.error('لا توجد فاتورة بهذا الرقم');
        setInvoicePreview(null);
        return;
      }

      const preview = {
        invoiceId: invoice.invoiceId || invoice.invoiceID || invoice.id || invoiceId,
        invoiceNumber: invoice.invoiceNumber || invoiceId,
        netAmount:
          invoice.netAmount ??
          invoice.totalAmount ??
          invoice.totalAfterRevision ??
          0,
        name:
          invoice.name ||
          invoice.customerNameAr ||
          invoice.customerNameEn ||
          invoice.supplierNameAr ||
          invoice.supplierNameEn ||
          '',
        partyType:
          invoice.partyType ||
          (invoice.customerID || invoice.customerId
            ? 'Customer'
            : invoice.supplierID || invoice.supplierId
              ? 'Supplier'
              : ''),
        customerID: invoice.customerID ?? invoice.customerId,
        supplierID: invoice.supplierID ?? invoice.supplierId,
      };

      setInvoicePreview(preview);
      setValue('details.0.partyID', String(preview.customerID ?? preview.supplierID ?? ''));
      setValue('details.0.partyName', preview.name);
      setValue('details.0.amount', String(preview.netAmount));
      setValue('details.0.notes', `سداد الفاتورة رقم ${preview.invoiceNumber}`);
      setValue('isReceipt', preview.partyType === 'Customer');
      toast.success('تم تحميل بيانات الفاتورة');
    } catch (error) {
      toast.error(getErrorMessage(error, 'لا توجد فاتورة بهذا الرقم'));
      setInvoicePreview(null);
    } finally {
      setIsLoadingInvoice(false);
    }
  }, [watchedInvoiceNumber, setValue]);

  const totalAmount = useMemo(
    () =>
      (watchedDetails || []).reduce(
        (sum, detail) => sum + (Number(detail.amount) || 0),
        0
      ),
    [watchedDetails]
  );

  const selectedBank = useMemo(
    () => bankOptions.find((option) => option.value === watchedBankId),
    [bankOptions, watchedBankId]
  );

  const selectedBankAccount = useMemo(
    () =>
      bankAccounts.find(
        (account) =>
          String(account.bankAccountID || account.id) === watchedBankAccountId
      ),
    [bankAccounts, watchedBankAccountId]
  );

  return (
    <div className="min-w-0 w-full max-w-full space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <ArrowLeft
            className="cursor-pointer text-gray-500 hover:text-gray-800"
            onClick={() => navigate(-1)}
          />
          <div>
            <h1 className="text-xl font-bold md:text-2xl">
              {isViewMode ? 'تفاصيل السند' : 'إنشاء سند قبض أو صرف'}
            </h1>
            <p className="text-sm text-gray-600">
              {isViewMode
                ? 'مراجعة بيانات السند وربطه بالفاتورة'
                : 'أدخل بيانات السند ثم اربطه بالفاتورة إذا لزم'}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          const payload = buildCashVoucherPayload(data);

          if (isEditMode) {
            const id = defaultValues?.voucherID || defaultValues?.id;
            updateMutation.mutate({ id, ...payload }, {
              onSuccess: () => navigate('/cash-vouchers'),
            });
          } else {
            createMutation.mutate(payload, {
              onSuccess: () => navigate('/cash-vouchers'),
            });
          }
        })}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:space-y-6 md:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Controller
            name="isReceipt"
            control={control}
            render={({ field }) => (
              <FormInput
                as="select"
                label="نوع السند"
                value={field.value ? 'receipt' : 'payment'}
                onChange={(event) =>
                  field.onChange(event.target.value === 'receipt')
                }
                disabled={isViewMode}
                required
              >
                {voucherTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormInput>
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DateInput
                label="تاريخ السند"
                value={field.value ?? ''}
                onChange={(event) => {
                  field.onChange(event);
                }}
                error={errors.date?.message}
                required
                readOnly={isViewMode}
              />
            )}
          />

          <Controller
            name="bankId"
            control={control}
            render={({ field }) => (
              <FormInput
                as="select"
                label="البنك"
                value={field.value ?? ''}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  setValue('bankAccountId', '');
                }}
                disabled={isViewMode}
                error={errors.bankId?.message}
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
            name="bankAccountId"
            control={control}
            render={({ field }) => (
              <FormInput
                as="select"
                label="حساب البنك"
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={isViewMode || !watchedBankId}
                error={errors.bankAccountId?.message}
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
                readOnly={isViewMode}
                error={errors.checkNumber?.message}
                required
              />
            )}
          />

          {/* <Controller
            name="costCenterId"
            control={control}
            render={({ field }) => (
              <FormInput
                as="select"
                label="مركز التكلفة"
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={isViewMode}
              >
                <option value="">اختر مركز التكلفة</option>
                {costCenterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormInput>
            )}
          /> */}

          <div className="">
            <label className="text-sm font-medium text-gray-700">
              رقم الفاتورة
            </label>
            <div className="flex gap-2">
              <Controller
                name="invoiceNumber"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    readOnly={isViewMode}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                )}
              />
              {!isViewMode ? (
                <button
                  type="button"
                  onClick={handleInvoiceLookup}
                  disabled={isLoadingInvoice}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  <Search size={16} />
                  {isLoadingInvoice ? 'جاري' : 'جلب'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">تفاصيل السند</h2>
          </div>

          {errors.details && !Array.isArray(errors.details) && errors.details.message ? (
            <p className="text-sm text-red-500">{errors.details.message}</p>
          ) : null}

          <div className="hidden w-full max-w-full overflow-x-auto lg:block">
            <table className="w-full min-w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
              <thead className="bg-primary/90 text-white">
                <tr>
                  <th className="p-3 text-right">
                    {watchedIsReceipt !== false ? 'العميل' : 'المورد'}
                  </th>
                  <th className="p-3 text-right">المبلغ</th>
                  <th className="p-3 text-right">ملاحظات</th>
                  {!isViewMode ? <th className="p-3 text-right"></th> : null}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const detailErrors = errors?.details?.[index] || {};

                  return (
                    <tr key={field.id} className="align-top border border-gray-200">
                      <td className="min-w-[220px] p-2">
                        <Controller
                          name={`details.${index}.partyID`}
                          control={control}
                          render={({ field: partyField }) => (
                            <SearchableSelect
                              value={partyField.value ?? ''}
                              onChange={(event) => {
                                partyField.onChange(event.target.value);
                                const selectedOption = partyOptionsWithCurrent.find(
                                  (option) => option.value === event.target.value
                                );
                                setValue(
                                  `details.${index}.partyName`,
                                  selectedOption?.label || ''
                                );
                              }}
                              options={partyOptionsWithCurrent}
                              placeholder={
                                watchedIsReceipt !== false
                                  ? 'اختر العميل'
                                  : 'اختر المورد'
                              }
                              disabled={isViewMode}
                              error={detailErrors?.partyID?.message}
                            />
                          )}
                        />
                      </td>
                      <td className="min-w-[140px] p-2">
                        <Controller
                          name={`details.${index}.amount`}
                          control={control}
                          render={({ field: amountField }) => (
                            <input
                              type="number"
                              value={amountField.value ?? ''}
                              onChange={amountField.onChange}
                              readOnly={isViewMode}
                              className={`w-full rounded-lg border px-3 py-2 ${
                                detailErrors?.amount?.message
                                  ? 'border-red-400'
                                  : 'border-gray-200'
                              }`}
                            />
                          )}
                        />
                        {detailErrors?.amount?.message ? (
                          <p className="mt-1 text-xs text-red-500">
                            {detailErrors.amount.message}
                          </p>
                        ) : null}
                      </td>
                      <td className="min-w-[260px] p-2">
                        <Controller
                          name={`details.${index}.notes`}
                          control={control}
                          render={({ field: notesField }) => (
                            <input
                              type="text"
                              value={notesField.value ?? ''}
                              onChange={notesField.onChange}
                              readOnly={isViewMode}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2"
                            />
                          )}
                        />
                      </td>
                      {!isViewMode ? (
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 lg:hidden">
            {fields.map((field, index) => {
              const detailErrors = errors?.details?.[index] || {};

              return (
                <div
                  key={field.id}
                  className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {`السطر ${index + 1}`}
                    </span>
                    {!isViewMode ? (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Controller
                      name={`details.${index}.partyID`}
                      control={control}
                      render={({ field: partyField }) => (
                        <FormInput
                          as="select"
                          label={
                            watchedIsReceipt !== false ? 'العميل' : 'المورد'
                          }
                          value={partyField.value ?? ''}
                          onChange={(event) => {
                            partyField.onChange(event.target.value);
                            const selectedOption = partyOptionsWithCurrent.find(
                              (option) => option.value === event.target.value
                            );
                            setValue(
                              `details.${index}.partyName`,
                              selectedOption?.label || ''
                            );
                          }}
                          disabled={isViewMode}
                          error={detailErrors?.partyID?.message}
                          required
                        >
                          <option value="">
                            {watchedIsReceipt !== false
                              ? 'اختر العميل'
                              : 'اختر المورد'}
                          </option>
                          {partyOptionsWithCurrent.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </FormInput>
                      )}
                    />

                    <Controller
                      name={`details.${index}.amount`}
                      control={control}
                      render={({ field: amountField }) => (
                        <FormInput
                          type="number"
                          label="المبلغ"
                          value={amountField.value ?? ''}
                          onChange={amountField.onChange}
                          readOnly={isViewMode}
                          error={detailErrors?.amount?.message}
                          required
                        />
                      )}
                    />

                    <Controller
                      name={`details.${index}.notes`}
                      control={control}
                      render={({ field: notesField }) => (
                        <FormInput
                          label="ملاحظات"
                          value={notesField.value ?? ''}
                          onChange={notesField.onChange}
                          readOnly={isViewMode}
                        />
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {invoicePreview ? (
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sky-800">
              <Eye size={16} />
              <h3 className="font-semibold">بيانات الفاتورة المرتبطة</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs text-gray-500">رقم الفاتورة</div>
                <div className="font-medium text-gray-900">
                  {invoicePreview.invoiceNumber || '-'}
                </div>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs text-gray-500">اسم الطرف</div>
                <div className="font-medium text-gray-900">
                  {invoicePreview.name || '-'}
                </div>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs text-gray-500">نوع الطرف</div>
                <div className="font-medium text-gray-900">
                  {invoicePreview.partyType === 'Customer'
                    ? 'عميل'
                    : invoicePreview.partyType === 'Supplier'
                      ? 'مورد'
                      : '-'}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">إجمالي المبلغ</div>
            <div className="mt-2 text-2xl font-bold text-primary">
              {totalAmount.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">اسم البنك</div>
            <div className="mt-2 font-semibold text-gray-900">
              {selectedBank?.label || '-'}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">حساب البنك</div>
            <div className="mt-2 font-semibold text-gray-900">
              {selectedBankAccount?.accountNumberWithBranch ||
                selectedBankAccount?.accountNumber ||
                '-'}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">حالة السند</div>
            <div className="mt-2 font-semibold text-gray-900">نشط</div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/cash-vouchers')}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700"
          >
            رجوع
          </button>
          {!isViewMode ? (
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg bg-primary px-6 py-2 text-white disabled:opacity-50"
            >
              {isEditMode ? 'تحديث السند' : 'حفظ السند'}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default CashVoucherForm;
