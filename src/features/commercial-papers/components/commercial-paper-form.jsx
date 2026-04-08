import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  useCreateCommercialPaper,
  useUpdateCommercialPaper,
} from '../hooks/commercial-papers.mutations';
import { useBanks } from '../hooks/commercial-papers.queries';
import {
  useCustomers,
  useSuppliers,
} from '../../invoices/hooks/invoices.queries';
import FormInput from '../../../shared/ui/input';

const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const getInitialValues = (defaultValues, paperType) => {
  const effectivePaperType =
    defaultValues?.paperType || paperType || 'RECEIVABLE';
  const isReceivable = effectivePaperType === 'RECEIVABLE';

  return {
    paperNumber: defaultValues?.paperNumber ?? '',
    amount: defaultValues?.amount ?? '',
    maturityDate: toDateInputValue(defaultValues?.maturityDate),
    noteTypeID: defaultValues?.noteTypeID
      ? String(defaultValues.noteTypeID)
      : '',
    customerID: isReceivable
      ? String(defaultValues?.customerID ?? defaultValues?.partyID ?? '')
      : '',
    supplierID: isReceivable
      ? ''
      : String(defaultValues?.supplierID ?? defaultValues?.partyID ?? ''),
    sourceInvoiceID: defaultValues?.sourceInvoiceID ?? '',
    chequeNumber: defaultValues?.chequeNumber ?? '',
    bankID: defaultValues?.bankID ? String(defaultValues.bankID) : '',
    notes: defaultValues?.notes ?? '',
    paperType: effectivePaperType,
  };
};

const CommercialPaperForm = ({ defaultValues, paperType }) => {
  const navigate = useNavigate();
  const createMutation = useCreateCommercialPaper();
  const updateMutation = useUpdateCommercialPaper();
  const { data: banks = [] } = useBanks();
  const { data: customers = [] } = useCustomers();
  const { data: suppliers = [] } = useSuppliers();

  const effectivePaperType =
    defaultValues?.paperType || paperType || 'RECEIVABLE';
  const isReceivable = effectivePaperType === 'RECEIVABLE';
  const isEditMode = Boolean(defaultValues?.paperID);

  const formDefaults = useMemo(
    () => getInitialValues(defaultValues, effectivePaperType),
    [defaultValues, effectivePaperType]
  );

  const { register, handleSubmit } = useForm({
    defaultValues: formDefaults,
    values: formDefaults,
  });

  const onSubmit = (data) => {
    const payload = {
      amount: Number(data.amount),
      maturityDate: new Date(data.maturityDate).toISOString(),
      noteTypeID: Number(data.noteTypeID),
      sourceInvoiceID: data.sourceInvoiceID ? Number(data.sourceInvoiceID) : 0,
      chequeNumber: data.chequeNumber || '',
      bankID: data.bankID ? Number(data.bankID) : 0,
      notes: data.notes || '',
      user: 'ms',
      ...(isReceivable
        ? { customerID: Number(data.customerID) }
        : { supplierID: Number(data.supplierID) }),
    };

    if (isEditMode) {
      updateMutation.mutate({
        id: defaultValues.paperID,
        ...payload,
      });
      return;
    }

    createMutation.mutate({
      paperType: effectivePaperType,
      ...payload,
    });
  };

  const backPath = isReceivable
    ? '/commercial-papers/receivable'
    : '/commercial-papers/payable';

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-300 space-y-6">
      <div>
        <h2 className="text-xl font-bold">
          {isEditMode
            ? isReceivable
              ? 'تعديل ورقة قبض'
              : 'تعديل ورقة دفع'
            : isReceivable
              ? 'إضافة ورقة قبض'
              : 'إضافة ورقة دفع'}
        </h2>
        <p className="text-sm text-gray-500">
          {isReceivable ? 'أدخل بيانات ورقة القبض' : 'أدخل بيانات ورقة الدفع'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {isEditMode && (
          <div>
            <label className="text-sm font-medium">رقم الورقة</label>
            <FormInput
              {...register('paperNumber')}
              className="FormInput"
              readOnly
            />
          </div>
        )}

        {isReceivable ? (
          <div>
            <FormInput as="select" label="العميل" {...register('customerID')}>
              <option value="">اختر العميل</option>
              {customers.map((customer) => (
                <option
                  key={customer.customerID}
                  value={String(customer.customerID)}
                >
                  {customer.customerNameAr || customer.customerNameEn}
                </option>
              ))}
            </FormInput>
          </div>
        ) : (
          <div>
            <FormInput as="select" label="المورد" {...register('supplierID')}>
              <option value="">اختر المورد</option>
              {suppliers.map((supplier) => (
                <option
                  key={supplier.supplierID}
                  value={String(supplier.supplierID)}
                >
                  {supplier.supplierNameAr || supplier.supplierNameEn}
                </option>
              ))}
            </FormInput>
          </div>
        )}

        <div>
          <label className="text-sm font-medium">القيمة</label>
          <FormInput
            type="number"
            {...register('amount')}
            className="FormInput"
            placeholder="القيمة"
          />
        </div>

        <div>
          <label className="text-sm font-medium">تاريخ الاستحقاق</label>
          <FormInput
            type="date"
            {...register('maturityDate')}
            className="FormInput"
          />
        </div>

        <div>
          <FormInput as="select" label="نوع السند" {...register('noteTypeID')}>
            <option value="">اختر النوع</option>
            <option value="1">سند إذني</option>
            <option value="2">كمبيالة</option>
            <option value="3">شيك</option>
          </FormInput>
        </div>

        <div>
          <label className="text-sm font-medium">الفاتورة</label>
          <FormInput
            type="number"
            {...register('sourceInvoiceID')}
            className="FormInput"
            placeholder="رقم الفاتورة"
          />
        </div>

        <div>
          <label className="text-sm font-medium">رقم الشيك</label>
          <FormInput
            {...register('chequeNumber')}
            className="FormInput"
            placeholder="رقم الشيك"
          />
        </div>

        <div>
          <FormInput as="select" label="البنك" {...register('bankID')}>
            <option value="">اختر البنك</option>
            {banks.map((bank) => (
              <option key={bank.bankID} value={String(bank.bankID)}>
                {bank.bankNameEn || bank.bankCode}
              </option>
            ))}
          </FormInput>
        </div>

        <div className="md:col-span-2">
          <FormInput
            as="textarea"
            label="ملاحظات"
            {...register('notes')}
            placeholder="ملاحظات"
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            رجوع
          </button>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
          >
            حفظ
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommercialPaperForm;
