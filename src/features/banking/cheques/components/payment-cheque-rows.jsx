import { Controller, useWatch } from 'react-hook-form';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { emptyPaymentCheque, totalInvoicePayments } from '../utils/cheque-payload';

const PaymentChequeRows = ({ control, register, errors, fields, append, remove, selectedId, onSelect }) => {
  const cheques = useWatch({ control, name: 'cheques' }) ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-gray-700">الشيكات ({fields.length})</h3>
        <button type="button" onClick={() => append(emptyPaymentCheque())} className="rounded-lg border border-primary px-4 py-2 text-primary hover:bg-primary/5">
          إضافة شيك
        </button>
      </div>
      {fields.map((row, index) => (
        <fieldset key={row.id} className={`rounded-xl border p-4 ${row.id === selectedId ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
          <legend className="px-2 font-bold text-gray-700">شيك {index + 1}</legend>
          <div className="mb-4 flex items-center justify-between gap-3">
            <button type="button" aria-pressed={row.id === selectedId} onClick={() => onSelect(row.id)} className="text-sm font-semibold text-primary">{row.id === selectedId ? 'الشيك المحدد للفواتير' : 'تحديد للفواتير'} ({cheques[index]?.invoicePayments?.length ?? 0})</button>
            <button type="button" disabled={fields.length === 1} onClick={() => remove(index)} className="text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`حذف شيك ${index + 1}`}>
              حذف الشيك
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormInput label="رقم الشيك" required {...register(`cheques.${index}.chequeNumber`)} error={errors.cheques?.[index]?.chequeNumber?.message} />
            <FormInput label="القيمة" type="number" step="0.01" required {...register(`cheques.${index}.amount`)} error={errors.cheques?.[index]?.amount?.message} />
            <FormInput label="اسم المستفيد" required {...register(`cheques.${index}.beneficiaryName`)} error={errors.cheques?.[index]?.beneficiaryName?.message} />
            {[['chequeDate', 'تاريخ الشيك'], ['dueDate', 'تاريخ الاستحقاق']].map(([name, label]) => (
              <Controller key={name} name={`cheques.${index}.${name}`} control={control} render={({ field }) => (
                <DateInput label={label} required error={errors.cheques?.[index]?.[name]?.message} {...field} />
              )} />
            ))}
          </div>
          {cheques[index]?.invoicePayments?.length > 0 && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3" aria-label={`فواتير شيك ${index + 1}`}>
              <h4 className="mb-2 text-sm font-bold text-gray-700">فواتير الشيك</h4>
              <ul className="space-y-2 text-sm">
                {cheques[index].invoicePayments.map((payment) => (
                  <li key={payment.invoiceID} className="flex flex-wrap items-center justify-between gap-2">
                    <span><bdi>{payment.invoiceNumber || payment.invoiceID}</bdi> — {payment.partyName}</span>
                    <span className="font-semibold text-primary">{formatCurrency(payment.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </fieldset>
      ))}
      {errors.cheques?.message || errors.cheques?.root?.message ? <p role="alert" className="text-sm text-red-600">{errors.cheques.message || errors.cheques.root?.message}</p> : null}
      <p className="font-bold text-gray-700">إجمالي قيمة الشيكات: {totalInvoicePayments(cheques).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </section>
  );
};

export default PaymentChequeRows;
