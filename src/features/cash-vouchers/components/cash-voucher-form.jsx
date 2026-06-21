import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import { getErrorMessage, toast } from '../../../shared/lib/toast';
import { useCustomers, useSuppliers } from '../../invoices/hooks/invoices.queries';
import { useBanks, useBankAccounts } from '../../banks/hooks/banks.queries';
import useCostTree from '../../tree/cost-tree/hooks/use-cost-tree';
import { getInvoiceForCashVoucher } from '../api/cash-vouchers.api';
import { usePaymentModes } from '../hooks/cash-vouchers.queries';
import { useCreateCashVoucher } from '../hooks/cash-vouchers.mutations';
import {
  buildCashVoucherPayload,
  getPaymentModeOptions,
  mapCashVoucherToFormValues,
} from '../utils/mapCashVoucherValues';

const emptyDetail = {
  amount: '',
  notes: '',
  partyID: '',
  partyName: '',
};

const EMPTY_DEFAULT_VALUES = {};

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

const getVoucherTypeLabel = (isReceipt) => (isReceipt ? 'سند قبض' : 'سند دفع');

const voucherTypeOptions = [
  { value: 'receipt', label: 'سند قبض' },
  { value: 'payment', label: 'سند صرف' },
];

const TRANSFER_PAYMENT_MODE_ID = '3';

const CashVoucherForm = ({ defaultValues, mode = 'create' }) => {
  const navigate = useNavigate();
  const createMutation = useCreateCashVoucher();
  const safeDefaultValues = defaultValues ?? EMPTY_DEFAULT_VALUES;
  const { data: banksResponse = [] } = useBanks();
  const { data: paymentModesResponse = [] } = usePaymentModes();
  const { data: customers = [] } = useCustomers();
  const { data: suppliers = [] } = useSuppliers();
  const { data: costTree = [] } = useCostTree();
  const paymentModes = useMemo(
    () => normalizeCollection(paymentModesResponse),
    [paymentModesResponse]
  );
  const paymentModeOptions = useMemo(
    () => getPaymentModeOptions(paymentModes),
    [paymentModes]
  );
  const isViewMode = mode === 'view';
  const [formData, setFormData] = useState(() =>
    mapCashVoucherToFormValues(safeDefaultValues, paymentModes)
  );
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const { data: bankAccountsResponse = [] } = useBankAccounts(formData.bankId);

  useEffect(() => {
    setFormData(mapCashVoucherToFormValues(safeDefaultValues, paymentModes));
  }, [safeDefaultValues, paymentModes]);

  const banks = useMemo(() => normalizeCollection(banksResponse), [banksResponse]);
  const bankAccounts = useMemo(
    () => normalizeCollection(bankAccountsResponse),
    [bankAccountsResponse]
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

  const partyOptions = useMemo(() => {
    const source = formData.isReceipt ? customers : suppliers;

    return source.map((party) => ({
      value: String(
        formData.isReceipt ? party.customerID : party.supplierID
      ),
      label:
        (formData.isReceipt
          ? party.customerNameAr || party.customerNameEn
          : party.supplierNameAr || party.supplierNameEn) || '',
    }));
  }, [customers, formData.isReceipt, suppliers]);

  const partyOptionsWithCurrent = useMemo(() => {
    const currentParty = formData.details[0];

    if (!currentParty?.partyName) {
      return partyOptions;
    }

    const hasMatch = partyOptions.some(
      (option) =>
        option.value === String(currentParty.partyID || '') ||
        option.label === currentParty.partyName
    );

    if (hasMatch) {
      return partyOptions;
    }

    return [
      {
        value: String(currentParty.partyID || currentParty.partyName),
        label: currentParty.partyName,
      },
      ...partyOptions,
    ];
  }, [formData.details, partyOptions]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index, field, value) => {
    setFormData((prev) => {
      const details = [...prev.details];
      details[index] = { ...details[index], [field]: value };

      const next = { ...prev, details };

      if (field === 'amount' || field === 'notes' || field === 'partyName') {
        next.amount = field === 'amount' ? value : details[0]?.amount || '';
        next.description = field === 'notes' ? value : details[0]?.notes || '';
        next.name = field === 'partyName' ? value : details[0]?.partyName || '';
      }

      return next;
    });
  };

  const addDetailRow = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { ...emptyDetail }],
    }));
  };

  const removeDetailRow = (index) => {
    setFormData((prev) => {
      const details = prev.details.filter((_, rowIndex) => rowIndex !== index);
      const fallbackDetails = details.length > 0 ? details : [{ ...emptyDetail }];
      return {
        ...prev,
        details: fallbackDetails,
        amount: fallbackDetails[0]?.amount || '',
        description: fallbackDetails[0]?.notes || '',
        name: fallbackDetails[0]?.partyName || '',
      };
    });
  };

  const handleBankChange = (event) => {
    const bankId = event.target.value;
    const selectedBank = bankOptions.find((option) => option.value === bankId);

    setFormData((prev) => ({
      ...prev,
      bankId,
      bankName: selectedBank?.label || '',
      bankAccountId: '',
      bankAccount: '',
    }));
  };

  const handleBankAccountChange = (event) => {
    const bankAccountId = event.target.value;
    const selectedAccount = bankAccounts.find(
      (account) => String(account.bankAccountID || account.id) === bankAccountId
    );

    setFormData((prev) => ({
      ...prev,
      bankAccountId,
      bankAccount:
        selectedAccount?.accountNumberWithBranch ||
        selectedAccount?.accountNumber ||
        selectedAccount?.iban ||
        selectedAccount?.accountNameAr ||
        selectedAccount?.accountNameEn ||
        '',
    }));
  };

  const handlePartyChange = (index, event) => {
    const selectedValue = event.target.value;
    const selectedOption = partyOptions.find(
      (option) => option.value === selectedValue
    );

    setFormData((prev) => {
      const details = [...prev.details];
      details[index] = {
        ...details[index],
        partyID: selectedValue,
        partyName: selectedOption?.label || '',
      };

      return {
        ...prev,
        details,
        name: details[0]?.partyName || '',
      };
    });
  };

  const applyInvoiceToDetails = (invoice) => {
    setFormData((prev) => {
      const firstDetail = prev.details[0] || { ...emptyDetail };
      const firstAmount =
        invoice.netAmount ??
        invoice.totalAmount ??
        firstDetail.amount ??
        prev.amount;
      const firstPartyName =
        invoice.name ||
        invoice.customerNameAr ||
        invoice.supplierNameAr ||
        firstDetail.partyName ||
        prev.name;
      const firstNotes = `سداد الفاتورة رقم ${invoice.invoiceNumber || prev.invoiceNumber}`;

      const details = prev.details.map((detail, index) =>
        index === 0
          ? {
              ...detail,
              amount: firstAmount,
              notes: firstNotes,
              partyID: String(
                invoice.customerID ??
                  invoice.customerId ??
                  invoice.supplierID ??
                  invoice.supplierId ??
                  detail.partyID ??
                  ''
              ),
              partyName: firstPartyName,
            }
          : detail
      );

      return {
        ...prev,
        isReceipt:
          invoice.partyType
            ? String(invoice.partyType).toLowerCase() === 'customer'
            : Boolean(invoice.customerID ?? invoice.customerId ?? prev.isReceipt),
        name: firstPartyName,
        amount: firstAmount,
        description: firstNotes,
        invoiceNumber: invoice.invoiceNumber || prev.invoiceNumber,
        details,
      };
    });
  };

  const handleInvoiceLookup = async () => {
    const invoiceNumber = String(formData.invoiceNumber || '').trim();

    if (!invoiceNumber) {
      toast.error('أدخل رقم الفاتورة أولاً');
      return;
    }

    setIsLoadingInvoice(true);

    try {
      const response = await getInvoiceForCashVoucher(invoiceNumber);
      const invoices = normalizeCollection(response);
      const matchedInvoice =
        invoices.find(
          (invoice) =>
            String(invoice.invoiceNumber || '').trim().toLowerCase() ===
            invoiceNumber.toLowerCase()
        ) || invoices[0];

      if (!matchedInvoice) {
        toast.error('لم يتم العثور على الفاتورة');
        setInvoicePreview(null);
        return;
      }

      const preview = {
        invoiceId:
          matchedInvoice.invoiceId || matchedInvoice.invoiceID || matchedInvoice.id,
        invoiceNumber: matchedInvoice.invoiceNumber || invoiceNumber,
        netAmount:
          matchedInvoice.netAmount ??
          matchedInvoice.totalAmount ??
          matchedInvoice.totalAfterRevision ??
          0,
        name:
          matchedInvoice.name ||
          matchedInvoice.customerNameAr ||
          matchedInvoice.customerNameEn ||
          matchedInvoice.supplierNameAr ||
          matchedInvoice.supplierNameEn ||
          '',
        partyType:
          matchedInvoice.partyType ||
          (matchedInvoice.customerID || matchedInvoice.customerId
            ? 'Customer'
            : matchedInvoice.supplierID || matchedInvoice.supplierId
              ? 'Supplier'
              : ''),
        customerID: matchedInvoice.customerID ?? matchedInvoice.customerId,
        supplierID: matchedInvoice.supplierID ?? matchedInvoice.supplierId,
      };

      setInvoicePreview(preview);
      applyInvoiceToDetails(preview);
      toast.success('تم تحميل بيانات الفاتورة');
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر جلب بيانات الفاتورة'));
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const totalAmount = useMemo(
    () =>
      formData.details.reduce(
        (sum, detail) => sum + (Number(detail.amount) || 0),
        0
      ),
    [formData.details]
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isViewMode) {
      navigate('/cash-vouchers');
      return;
    }

    if (!formData.date) {
      toast.error('تاريخ السند مطلوب');
      return;
    }

    if (!formData.bankId || !formData.bankAccountId) {
      toast.error('اختر البنك وحساب البنك');
      return;
    }

    createMutation.mutate(buildCashVoucherPayload(formData), {
      onSuccess: () => navigate('/cash-vouchers'),
    });
  };

  const selectedVoucherLabel = getVoucherTypeLabel(formData.isReceipt);

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
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:space-y-6 md:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormInput
            as="select"
            label="نوع السند"
            value={formData.isReceipt ? 'receipt' : 'payment'}
            onChange={(event) =>
              handleFieldChange('isReceipt', event.target.value === 'receipt')
            }
            disabled={isViewMode}
          >
            {voucherTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

          <FormInput
            as="select"
            label="طريقة الدفع"
            value={formData.paymentModeId}
            onChange={(event) =>
              handleFieldChange('paymentModeId', event.target.value)
            }
            disabled={isViewMode}
          >
            <option value="">اختر طريقة الدفع</option>
            {paymentModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

          <FormInput
            type="date"
            label="تاريخ السند"
            value={formData.date}
            onChange={(event) => handleFieldChange('date', event.target.value)}
            readOnly={isViewMode}
          />

          <FormInput
            as="select"
            label="البنك"
            value={formData.bankId}
            onChange={handleBankChange}
            disabled={isViewMode}
          >
            <option value="">اختر البنك</option>
            {bankOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

          <FormInput
            as="select"
            label="حساب البنك"
            value={formData.bankAccountId}
            onChange={handleBankAccountChange}
            disabled={isViewMode || !formData.bankId}
          >
            <option value="">اختر حساب البنك</option>
            {bankAccountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

          <FormInput
            label="رقم الشيك"
            value={formData.checkNumber}
            onChange={(event) =>
              handleFieldChange('checkNumber', event.target.value)
            }
            readOnly={isViewMode}
          />

          <FormInput
            as="select"
            label="مركز التكلفة"
            value={formData.costCenterId}
            onChange={(event) =>
              handleFieldChange('costCenterId', event.target.value)
            }
            disabled={isViewMode}
          >
            <option value="">اختر مركز التكلفة</option>
            {costCenterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

          {String(formData.paymentModeId) === TRANSFER_PAYMENT_MODE_ID ? (
            <>
              <FormInput
                as="select"
                label="من حساب بنكي"
                value={formData.fromBankAccountId}
                onChange={(event) =>
                  handleFieldChange('fromBankAccountId', event.target.value)
                }
                disabled={isViewMode}
              >
                <option value="">اختر الحساب</option>
                {bankAccountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormInput>

              <FormInput
                as="select"
                label="إلى حساب بنكي"
                value={formData.toBankAccountId}
                onChange={(event) =>
                  handleFieldChange('toBankAccountId', event.target.value)
                }
                disabled={isViewMode}
              >
                <option value="">اختر الحساب</option>
                {bankAccountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormInput>
            </>
          ) : null}

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              رقم الفاتورة
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(event) =>
                  handleFieldChange('invoiceNumber', event.target.value)
                }
                readOnly={isViewMode}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
              {!isViewMode ? (
                <button
                  type="button"
                  onClick={handleInvoiceLookup}
                  disabled={isLoadingInvoice}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  <Search size={16} />
                  {isLoadingInvoice ? 'جاري الجلب' : 'جلب الفاتورة'}
                </button>
              ) : null}
            </div>
          </div>

          {/* <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">الحالة</label>
            <div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
              {selectedVoucherLabel}
            </div>
          </div> */}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">تفاصيل السند</h2>
            {/* {!isViewMode ? (
              <button
                type="button"
                onClick={addDetailRow}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
              >
                <Plus size={16} />
                إضافة سطر
              </button>
            ) : null} */}
          </div>

          <div className="hidden w-full max-w-full overflow-x-auto lg:block">
            <table className="w-full min-w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
              <thead className="bg-primary/90 text-white">
                <tr>
                  <th className="p-3 text-right">
                    {formData.isReceipt ? 'العميل' : 'المورد'}
                  </th>
                  <th className="p-3 text-right">المبلغ</th>
                  <th className="p-3 text-right">ملاحظات</th>
                  {!isViewMode ? <th className="p-3 text-right"></th> : null}
                </tr>
              </thead>
              <tbody>
                {formData.details.map((detail, index) => (
                  <tr key={index} className="align-top border border-gray-200">
                    <td className="min-w-[220px] p-2">
                      <SearchableSelect
                        value={
                          detail.partyID ||
                          partyOptionsWithCurrent.find(
                            (option) => option.label === detail.partyName
                          )?.value || ''
                        }
                        onChange={(event) => handlePartyChange(index, event)}
                        options={partyOptionsWithCurrent}
                        placeholder={formData.isReceipt ? 'اختر العميل' : 'اختر المورد'}
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="min-w-[140px] p-2">
                      <input
                        type="number"
                        value={detail.amount}
                        onChange={(event) =>
                          handleRowChange(index, 'amount', event.target.value)
                        }
                        readOnly={isViewMode}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>
                    <td className="min-w-[260px] p-2">
                      <input
                        type="text"
                        value={detail.notes}
                        onChange={(event) =>
                          handleRowChange(index, 'notes', event.target.value)
                        }
                        readOnly={isViewMode}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>
                    {!isViewMode ? (
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeDetailRow(index)}
                          className="text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 lg:hidden">
            {formData.details.map((detail, index) => (
              <div
                key={index}
                className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {`السطر ${index + 1}`}
                  </span>
                  {!isViewMode ? (
                    <button
                      type="button"
                      onClick={() => removeDetailRow(index)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput
                    as="select"
                    label={formData.isReceipt ? 'العميل' : 'المورد'}
                    value={
                      detail.partyID ||
                      partyOptionsWithCurrent.find(
                        (option) => option.label === detail.partyName
                      )?.value || ''
                    }
                    onChange={(event) => handlePartyChange(index, event)}
                    disabled={isViewMode}
                  >
                    <option value="">
                      {formData.isReceipt ? 'اختر العميل' : 'اختر المورد'}
                    </option>
                    {partyOptionsWithCurrent.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </FormInput>

                  <FormInput
                    type="number"
                    label="المبلغ"
                    value={detail.amount}
                    onChange={(event) =>
                      handleRowChange(index, 'amount', event.target.value)
                    }
                    readOnly={isViewMode}
                  />

                  <FormInput
                    label="ملاحظات"
                    value={detail.notes}
                    onChange={(event) =>
                      handleRowChange(index, 'notes', event.target.value)
                    }
                    readOnly={isViewMode}
                  />
                </div>
              </div>
            ))}
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {/* <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">رقم السند</div>
            <div className="mt-2 font-semibold text-gray-900">
              {formData.voucherID || '-'}
            </div>
          </div> */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">إجمالي المبلغ</div>
            <div className="mt-2 text-2xl font-bold text-primary">
              {totalAmount.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">اسم البنك</div>
            <div className="mt-2 font-semibold text-gray-900">
              {formData.bankName || '-'}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">حساب البنك</div>
            <div className="mt-2 font-semibold text-gray-900">
              {formData.bankAccount || '-'}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">حالة السند</div>
            <div className="mt-2 font-semibold text-gray-900">
              {formData.isVoid
                ? 'ملغي'
                : formData.isCleared
                  ? 'تمت المقاصة'
                  : 'نشط'}
            </div>
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
              disabled={createMutation.isPending}
              className="rounded-lg bg-primary px-6 py-2 text-white disabled:opacity-50"
            >
              حفظ السند
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default CashVoucherForm;
