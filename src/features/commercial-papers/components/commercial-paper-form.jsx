import { useForm } from 'react-hook-form';
import {
  useCreateCommercialPaper,
  useUpdateCommercialPaper,
} from '../hooks/commercial-papers.mutations';
import FormInput from '../../../shared/ui/input';

const CommercialPaperForm = ({ defaultValues }) => {
  const { register, handleSubmit } = useForm({
    defaultValues,
  });

  const createMutation = useCreateCommercialPaper();
  const updateMutation = useUpdateCommercialPaper();

  const onSubmit = (data) => {
    const payload = {
      customerID: Number(data.customerID),
      amount: Number(data.amount),
      maturityDate: data.maturityDate,
      noteTypeID: Number(data.noteTypeID),
      sourceInvoiceID: data.sourceInvoiceID
        ? Number(data.sourceInvoiceID)
        : null,
      chequeNumber: data.chequeNumber || '',
      bankID: data.bankID ? Number(data.bankID) : null,
      notes: data.notes || '',
      user: 'admin', // 🔥 replace with logged-in user later
    };

    if (defaultValues?.paperID) {
      updateMutation.mutate({
        id: defaultValues.paperID,
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-300 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">
          {defaultValues ? 'تعديل ورقة تجارية' : 'إضافة ورقة تجارية'}
        </h2>
        <p className="text-sm text-gray-500">أدخل بيانات الورقة التجارية</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Customer */}
        <div>
          <label className="text-sm font-medium">العميل</label>
          <FormInput
            type="number"
            {...register('customerID')}
            className="FormInput"
            placeholder="رقم العميل"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium">القيمة</label>
          <FormInput
            type="number"
            {...register('amount')}
            className="FormInput"
            placeholder="القيمة"
          />
        </div>

        {/* Maturity Date */}
        <div>
          <label className="text-sm font-medium">تاريخ الاستحقاق</label>
          <FormInput
            type="date"
            {...register('maturityDate')}
            className="FormInput"
          />
        </div>

        {/* Note Type */}
        <div>
          <FormInput as="select" label="نوع السند" {...register('noteTypeID')}>
            <option value="">اختر النوع</option>
            <option value="1">سند إذني</option>
            <option value="2">شيك</option>
          </FormInput>
        </div>

        {/* Source Invoice */}
        <div>
          <label className="text-sm font-medium">الفاتورة</label>
          <FormInput
            type="number"
            {...register('sourceInvoiceID')}
            className="FormInput"
            placeholder="رقم الفاتورة (اختياري)"
          />
        </div>

        {/* Cheque Number */}
        <div>
          <label className="text-sm font-medium">رقم الشيك</label>
          <FormInput
            {...register('chequeNumber')}
            className="FormInput"
            placeholder="رقم الشيك"
          />
        </div>

        {/* Bank */}
        <div>
          <label className="text-sm font-medium">البنك</label>
          <FormInput
            type="number"
            {...register('bankID')}
            className="FormInput"
            placeholder="رقم البنك"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <FormInput
            as="textarea"
            label="ملاحظات"
            {...register('notes')}
            placeholder="ملاحظات"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-end">
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
