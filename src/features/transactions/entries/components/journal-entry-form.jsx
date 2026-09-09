import useJournalEntryForm from '../hooks/use-journal-entry-form';
import JournalEntryHeader from './journal-entry-header';
import JournalEntryHeaderFields from './journal-entry-header-fields';
import JournalEntryDetails from './journal-entry-details';
import JournalEntryFormActions from './journal-entry-form-actions';

const JournalEntryForm = ({
  defaultValues = {},
  mode = 'create',
  showEntryDetailsButton = false,
  viewOnly = false,
}) => {
  // All form state, data fetching, mutations, and handlers live in this hook
  const {
    navigate,
    register,
    control,
    errors,
    submitHandler,
    fields,
    append,
    remove,
    watchedDetails,
    watchedExchangeRate,
    currencyOptions,
    periodOptions,
    statusOptions,
    isEditMode,
    entryId,
    createMutation,
    updateMutation,
    postMutation,
    reverseMutation,
    totalDebit,
    totalCredit,
    isBalanced,
    isPosted,
    isReversed,
    readOnly,
    createDetailRow,
    handleAmountChange,
    handleCustomerChange,
    handleSupplierChange,
    handleLoadInvoiceDetails,
    handlePostEntry,
    handleReverseEntry,
    handleExchangeRateChange,
  } = useJournalEntryForm({ defaultValues, mode, viewOnly });

  return (
    <div className="min-w-0 w-full max-w-full space-y-4 md:space-y-6">
      <JournalEntryHeader
        navigate={navigate}
        isEditMode={isEditMode}
        entryId={entryId}
        showEntryDetailsButton={showEntryDetailsButton}
        viewOnly={viewOnly}
        postMutation={postMutation}
        reverseMutation={reverseMutation}
        isPosted={isPosted}
        isReversed={isReversed}
        handlePostEntry={handlePostEntry}
        handleReverseEntry={handleReverseEntry}
      />

      <form
        onSubmit={submitHandler}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 md:space-y-6 md:p-6"
      >
        <JournalEntryHeaderFields
          control={control}
          errors={errors}
          register={register}
          periodOptions={periodOptions}
          statusOptions={statusOptions}
          currencyOptions={currencyOptions}
          watchedExchangeRate={watchedExchangeRate}
          readOnly={readOnly}
          handleExchangeRateChange={handleExchangeRateChange}
        />

        <JournalEntryDetails
          fields={fields}
          control={control}
          errors={errors}
          register={register}
          remove={remove}
          append={append}
          createDetailRow={createDetailRow}
          watchedDetails={watchedDetails}
          readOnly={readOnly}
          handleAmountChange={handleAmountChange}
          handleCustomerChange={handleCustomerChange}
          handleSupplierChange={handleSupplierChange}
          handleLoadInvoiceDetails={handleLoadInvoiceDetails}
          totalDebit={totalDebit}
          totalCredit={totalCredit}
        />

        <JournalEntryFormActions
          navigate={navigate}
          isBalanced={isBalanced}
          isEditMode={isEditMode}
          createMutation={createMutation}
          updateMutation={updateMutation}
        />
      </form>
    </div>
  );
};

export default JournalEntryForm;