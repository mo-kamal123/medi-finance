import { Controller } from 'react-hook-form';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import CurrencyExchangeInput from './currency-exchange-input';
import { JOURNAL_TYPES } from '../utils/journal-entry.utils';

// Grid of the entry header fields (date, type, reference, period, status, currency)
const JournalEntryHeaderFields = ({
  control,
  errors,
  register,
  periodOptions,
  statusOptions,
  currencyOptions,
  watchedExchangeRate,
  readOnly,
  handleExchangeRateChange,
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Controller
      name="entryDate"
      control={control}
      render={({ field }) => (
        <DateInput
          label="التاريخ"
          value={field.value ?? ''}
          onChange={field.onChange}
          required
          error={errors.entryDate?.message}
        />
      )}
    />

    <Controller
      name="journalType"
      control={control}
      render={({ field }) => (
        <FormInput
          as="select"
          label="نوع القيد"
          placeholder="اختر نوع القيد"
          value={field.value ?? ''}
          onChange={field.onChange}
          required
          error={errors.journalType?.message}
        >
          {JOURNAL_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </FormInput>
      )}
    />

    <FormInput label="رقم المرجع" placeholder="أدخل رقم المرجع" {...register('referenceNumber')} />

    <Controller
      name="currencyID"
      control={control}
      render={({ field }) => (
        <CurrencyExchangeInput
          currencyValue={field.value ?? ''}
          exchangeRateValue={watchedExchangeRate ?? ''}
          onCurrencyChange={field.onChange}
          onExchangeRateChange={(e) => handleExchangeRateChange(e)}
          currencyOptions={currencyOptions}
          disabled={readOnly}
        />
      )}
    />

    <Controller
      name="financialPeriodID"
      control={control}
      render={({ field }) => (
        <FormInput
          as="select"
          label="الفترة المالية"
          placeholder="اختر الفترة المالية"
          value={field.value ?? ''}
          onChange={field.onChange}
          required
          error={errors.financialPeriodID?.message}
        >
          <option value="">اختر الفترة المالية</option>
          {periodOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </FormInput>
      )}
    />

    <Controller
      name="statusID"
      control={control}
      render={({ field }) => (
        <FormInput
          as="select"
          label="الحالة"
          placeholder="اختر الحالة"
          value={field.value ?? ''}
          onChange={field.onChange}
          required
          error={errors.statusID?.message}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </FormInput>
      )}
    />

    <FormInput
      as="textarea"
      label="الوصف عربي"
      placeholder="أدخل وصف القيد بالعربية"
      containerClass="md:col-span-2 xl:col-span-3"
      readOnly={readOnly}
      {...register('description')}
    />
  </div>
);

export default JournalEntryHeaderFields;
