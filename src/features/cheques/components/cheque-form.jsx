import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import { useCreateCheque } from '../hooks/cheques.mutations';
import { useChequeBanks, useChequeCustomers } from '../hooks/cheques.queries';
import { chequeSchema } from '../validation/cheque.validation';

const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const getInitialValues = (defaultValues) => ({
  chequeNumber: defaultValues?.chequeNumber ?? '',
  chequeDate: toDateInputValue(defaultValues?.chequeDate),
  amount: defaultValues?.amount ?? '',
  customerID: defaultValues?.customerID ? String(defaultValues.customerID) : '',
  bankID: defaultValues?.bankID ? String(defaultValues.bankID) : '',
  invoiceID: defaultValues?.invoiceID ?? '',
  notes: defaultValues?.notes ?? '',
});

const ChequeForm = ({ defaultValues, mode = 'create' }) => {
  const navigate = useNavigate();
  const createMutation = useCreateCheque();
  const { data: customers = [] } = useChequeCustomers();
  const { data: banks = [] } = useChequeBanks();
  const isViewMode = mode === 'view';

  const formDefaults = useMemo(
    () => getInitialValues(defaultValues),
    [defaultValues]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: formDefaults,
    values: formDefaults,
    resolver: zodResolver(chequeSchema),
  });

  const onSubmit = (data) => {
    const payload = {
      customerID: Number(data.customerID),
      chequeNumber: data.chequeNumber,
      chequeDate: new Date(data.chequeDate).toISOString(),
      amount: Number(data.amount),
      bankID: Number(data.bankID),
      invoiceID: data.invoiceID ? Number(data.invoiceID) : 0,
      notes: data.notes || '',
      user: 'ms',
    };

    createMutation.mutate(payload, {
      onSuccess: () => navigate('/cheques'),
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-300 space-y-6">
      <div>
        <h2 className="text-xl font-bold">
          {isViewMode ? 'تفاصيل الشيك' : 'إضافة شيك'}
        </h2>
        <p className="text-sm text-gray-500">
          {isViewMode ? 'استعراض بيانات الشيك' : 'أدخل بيانات الشيك'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <FormInput
            label="رقم الشيك"
            {...register('chequeNumber')}
            error={errors.chequeNumber?.message}
            readOnly={isViewMode}
          />
        </div>

        <div>
          <FormInput
            type="date"
            label="تاريخ الشيك"
            {...register('chequeDate')}
            error={errors.chequeDate?.message}
            readOnly={isViewMode}
          />
        </div>

        <div>
          <FormInput
            type="number"
            label="القيمة"
            {...register('amount')}
            error={errors.amount?.message}
            readOnly={isViewMode}
          />
        </div>

        <div>
          <FormInput
            as="select"
            label="العميل"
            {...register('customerID')}
            error={errors.customerID?.message}
            disabled={isViewMode}
          >
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

        <div>
          <FormInput
            as="select"
            label="البنك"
            {...register('bankID')}
            error={errors.bankID?.message}
            disabled={isViewMode}
          >
            <option value="">اختر البنك</option>
            {banks.map((bank) => (
              <option key={bank.bankID} value={String(bank.bankID)}>
                {bank.bankNameEn || bank.bankCode}
              </option>
            ))}
          </FormInput>
        </div>

        <div>
          <FormInput
            type="number"
            label="الفاتورة"
            {...register('invoiceID')}
            readOnly={isViewMode}
          />
        </div>

        <div className="md:col-span-2">
          <FormInput
            as="textarea"
            label="ملاحظات"
            {...register('notes')}
            readOnly={isViewMode}
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/cheques')}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            رجوع
          </button>

          {!isViewMode && (
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
            >
              حفظ
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChequeForm;
