import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import PageLoader from '../../../shared/ui/page-loader';
import { toast } from '../../../shared/lib/toast';
import {
  useFinancialPeriods,
  useSuppliers,
} from '../hooks/invoices.queries';
import { useCreateBatchInvoice } from '../hooks/invoices.mutations';
import { invoicesKeys } from '../hooks/invoices.keys';
import { getBatchByNumber } from '../api/invoices-api';
import { toDateInputValue } from '../utils/mapInvoiceToFormValues';
import { formatCurrency } from '../utils/format-currency';

const createEmptyBatchForm = () => ({
  batchID: null,
  batchNumber: '',
  supplierID: '',
  financialPeriodID: '',
  invoiceDate: '',
  dueDate: '',
  discounts: [],
  details: [],
});

const DISCOUNT_TYPE_OPTIONS = [
  'خصم مكتسب -مراجعه فنية',
  'خصم مسموح بة',
  'ايراد خصم ادارة فنية',
  'خصم مكتسب',
  'خصم مكتسب - تعاقدات',
  'خصم من المنبع',
  'خصم اضافى موردين',
  'خصم مشتريات',
  'Earned Discount - Technical Review',
  'Allowed Discount',
  'Technical Management Discount Revenue',
  'Earned Discount',
  'Earned Discount - Contracts',
  'Discount at Source',
  'Additional Supplier Discount',
  'Purchase Discount',
].map((item) => ({
  value: item,
  label: item,
}));

const createEmptyDiscount = () => ({
  discountType: '',
  amount: '',
});

const mapBatchToFormData = (batch) => ({
  batchID: batch.batchID,
  batchNumber: String(batch.batchNumber ?? ''),
  supplierID: batch.supplierID ? String(batch.supplierID) : '',
  financialPeriodID: batch.financialPeriodID ? String(batch.financialPeriodID) : '',
  invoiceDate: toDateInputValue(batch.batchDate),
  dueDate: toDateInputValue(batch.batchDate),
  discounts:
    Number(batch.earnedDiscount ?? 0) > 0
      ? [
          {
            discountType: 'خصم مكتسب',
            amount: Number(batch.earnedDiscount ?? 0),
          },
        ]
      : [],
  details:
    batch.details?.map((detail) => ({
      batchDetailID: detail.batchDetailID,
      customerID: detail.customerID,
      customerCode: detail.customerCode,
      customerNameAr: detail.customerNameAr || detail.customerNameEn || '-',
      totalAmount: Number(
        detail.totalAmount ??
          detail.totalAfterRevision ??
          detail.totalAfterCopayment ??
          0
      ),
    })) || [],
});

const NewBatchInvoicePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createBatchInvoiceMutation = useCreateBatchInvoice();
  const { data: suppliers = [] } = useSuppliers();
  const { data: financialPeriods = [] } = useFinancialPeriods();

  const [batchNumberInput, setBatchNumberInput] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [formData, setFormData] = useState(createEmptyBatchForm);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  const totalAmount = useMemo(
    () =>
      formData.details.reduce(
        (sum, detail) => sum + (Number(detail.totalAmount) || 0),
        0
      ),
    [formData.details]
  );

  const discountAmount = useMemo(
    () =>
      formData.discounts.reduce(
        (sum, discount) => sum + (Number(discount.amount) || 0),
        0
      ),
    [formData.discounts]
  );
  const netAmount = Math.max(totalAmount - discountAmount, 0);

  const supplierOptions = useMemo(
    () => {
      const baseOptions = suppliers.map((supplier) => ({
        value: String(supplier.supplierID),
        label: supplier.supplierNameAr || supplier.supplierNameEn,
      }));

      if (!batchData?.supplierID) {
        return baseOptions;
      }

      const batchSupplierValue = String(batchData.supplierID);
      const hasBatchSupplier = baseOptions.some(
        (option) => option.value === batchSupplierValue
      );

      if (hasBatchSupplier) {
        return baseOptions;
      }

      return [
        {
          value: batchSupplierValue,
          label:
            batchData.supplierNameAr ||
            batchData.supplierNameEn ||
            batchData.supplierCode ||
            batchSupplierValue,
        },
        ...baseOptions,
      ];
    },
    [batchData, suppliers]
  );

  const periodOptions = useMemo(
    () =>
      financialPeriods.map((period) => ({
        value: String(period.financialPeriodID),
        label: period.nameAr || period.financialPeriodNameAr || period.nameEn,
      })),
    [financialPeriods]
  );

  const canSubmit =
    Number(formData.batchID) > 0 &&
    Number(formData.supplierID) > 0 &&
    Number(formData.financialPeriodID) > 0 &&
    Boolean(formData.invoiceDate) &&
    Boolean(formData.dueDate) &&
    formData.details.length > 0 &&
    formData.details.every((detail) => Number(detail.totalAmount) >= 0);

  const handleLoadBatch = async () => {
    const normalizedBatchNumber = batchNumberInput.trim();
    if (!normalizedBatchNumber) {
      toast.error('أدخل رقم الدفعة أولاً');
      return;
    }

    setIsLoadingBatch(true);

    try {
      const response = await queryClient.fetchQuery({
        queryKey: invoicesKeys.batch(normalizedBatchNumber),
        queryFn: () => getBatchByNumber(normalizedBatchNumber),
      });

      const batch = response?.data ?? response;
      setBatchData(batch);
      setFormData(mapBatchToFormData(batch));
      setBatchNumberInput(String(batch.batchNumber ?? normalizedBatchNumber));
      toast.success('تم تحميل بيانات الدفعة');
    } catch (error) {
      console.error('Error loading batch:', error);
      toast.error('تعذر تحميل بيانات الدفعة');
    } finally {
      setIsLoadingBatch(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDetailAmountChange = (index, value) => {
    setFormData((prev) => {
      const details = [...prev.details];
      details[index] = {
        ...details[index],
        totalAmount: value,
      };
      return { ...prev, details };
    });
  };

  const addDiscountRow = () => {
    setFormData((prev) => ({
      ...prev,
      discounts: [...prev.discounts, createEmptyDiscount()],
    }));
  };

  const removeDiscountRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleDiscountChange = (index, field, value) => {
    setFormData((prev) => {
      const discounts = [...prev.discounts];
      discounts[index] = {
        ...discounts[index],
        [field]: value,
      };
      return { ...prev, discounts };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error('أكمل بيانات الفاتورة قبل التأكيد');
      return;
    }

    const payload = {
      batchID: Number(formData.batchID),
      batchNumber: formData.batchNumber,
      supplierID: Number(formData.supplierID),
      financialPeriodID: Number(formData.financialPeriodID),
      invoiceDate: new Date(formData.invoiceDate).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      totalAmount,
      discountAmount,
      netAmount,
      details: formData.details.map((detail) => ({
        batchDetailID: Number(detail.batchDetailID),
        customerID: Number(detail.customerID),
        totalAmount: Number(detail.totalAmount) || 0,
      })),
      discounts: formData.discounts
        .filter(
          (discount) =>
            discount.discountType && Number(discount.amount || 0) > 0
        )
        .map((discount) => ({
          discountType: discount.discountType,
          amount: Number(discount.amount) || 0,
        })),
      installments: [],
      createdBy: 'ms',
    };

    try {
      await createBatchInvoiceMutation.mutateAsync(payload);
      navigate('/batches-invoices');
    } catch (error) {
      console.error('Error creating batch invoice:', error);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6 md:p-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/batches-invoices')}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إنشاء فاتورة دفعة</h1>
            <p className="text-sm text-gray-600">
              أدخل رقم الدفعة لتحميل بياناتها ثم عدّل القيم قبل التأكيد
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <FormInput
            label="رقم الدفعة"
            value={batchNumberInput}
            onChange={(event) => setBatchNumberInput(event.target.value)}
            placeholder="مثال: 3990"
            containerClass="md:min-w-[420px]"
          />

          <button
            type="submit"
            onClick={handleLoadBatch}
            disabled={isLoadingBatch}
            className="mt-0 w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-white hover:bg-primary/90 disabled:opacity-60 md:self-end"
          >
            <Search size={16} />
            {isLoadingBatch ? 'جاري التحميل...' : 'تحميل الدفعة'}
          </button>
        </div>
      </div>

      {isLoadingBatch ? <PageLoader label="جاري تحميل بيانات الدفعة..." /> : null}

      {batchData ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">حالة الدفعة</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {batchData.status || '-'}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">إجمالي التفاصيل</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">الخصم</p>
              <p className="mt-2 text-lg font-semibold text-red-500">
                {formatCurrency(discountAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">الصافي</p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>

          {batchData.invoiceID ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              هذه الدفعة مرتبطة بالفعل بفاتورة رقم{' '}
              <span className="font-semibold">{batchData.invoiceNumber}</span>.
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormInput
                label="رقم الدفعة"
                value={formData.batchNumber}
                readOnly
                className="bg-gray-50 text-gray-600"
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  المورد
                </label>
                <SearchableSelect
                  value={formData.supplierID}
                  onChange={(event) =>
                    handleFieldChange('supplierID', event.target.value)
                  }
                  options={supplierOptions}
                  placeholder="اختر المورد"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  الفترة المالية
                </label>
                <SearchableSelect
                  value={formData.financialPeriodID}
                  onChange={(event) =>
                    handleFieldChange('financialPeriodID', event.target.value)
                  }
                  options={periodOptions}
                  placeholder="اختر الفترة المالية"
                />
              </div>

              <FormInput
                type="date"
                label="تاريخ الفاتورة"
                value={formData.invoiceDate}
                onChange={(event) =>
                  handleFieldChange('invoiceDate', event.target.value)
                }
              />

              <FormInput
                type="date"
                label="تاريخ الاستحقاق"
                value={formData.dueDate}
                onChange={(event) =>
                  handleFieldChange('dueDate', event.target.value)
                }
              />

            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">الخصومات</h2>
                <p className="text-sm text-gray-500">
                  أضف نوع الخصم وقيمته وسيتم احتسابه في صافي الفاتورة
                </p>
              </div>

              <button
                type="button"
                onClick={addDiscountRow}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
              >
                <Plus size={16} />
                إضافة خصم
              </button>
            </div>

            {formData.discounts.length > 0 ? (
              <div className="space-y-3">
                {formData.discounts.map((discount, index) => (
                  <div
                    key={`${discount.discountType}-${index}`}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[minmax(0,1fr)_180px_56px]"
                  >
                    <SearchableSelect
                      value={discount.discountType}
                      onChange={(event) =>
                        handleDiscountChange(
                          index,
                          'discountType',
                          event.target.value
                        )
                      }
                      options={DISCOUNT_TYPE_OPTIONS}
                      placeholder="اختر نوع الخصم"
                    />

                    <FormInput
                      type="number"
                      value={discount.amount}
                      onChange={(event) =>
                        handleDiscountChange(index, 'amount', event.target.value)
                      }
                      placeholder="قيمة الخصم"
                    />

                    <button
                      type="button"
                      onClick={() => removeDiscountRow(index)}
                      className="flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                      aria-label="حذف الخصم"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                لم يتم إضافة خصومات بعد
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">تفاصيل الدفعة</h2>
              <p className="text-sm text-gray-500">
                يمكنك تعديل قيمة كل عميل قبل إنشاء الفاتورة
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">كود العميل</th>
                    <th className="px-4 py-3 text-right font-medium">اسم العميل</th>
                    <th className="px-4 py-3 text-right font-medium">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.details.map((detail, index) => (
                    <tr key={detail.batchDetailID} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-600">{detail.customerCode}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {detail.customerNameAr}
                      </td>
                      <td className="min-w-[180px] px-4 py-3">
                        <FormInput
                          type="number"
                          value={detail.totalAmount}
                          onChange={(event) =>
                            handleDetailAmountChange(index, event.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/batches-invoices')}
              className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={!canSubmit || createBatchInvoiceMutation.isPending}
              className="rounded-xl bg-primary px-6 py-3 text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {createBatchInvoiceMutation.isPending
                ? 'جاري إنشاء الفاتورة...'
                : 'تأكيد وإنشاء الفاتورة'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
};

export default NewBatchInvoicePage;
