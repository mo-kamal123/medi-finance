// Bottom actions: back link and save/submit button
const JournalEntryFormActions = ({
  navigate,
  isBalanced,
  isEditMode,
  createMutation,
  updateMutation,
}) => (
  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
    <button
      type="button"
      onClick={() => navigate('/entries')}
      className="rounded-lg border border-gray-400 px-6 py-2 text-gray-700"
    >
      رجوع
    </button>
    <button
      type="submit"
      disabled={
        !isBalanced || createMutation.isPending || updateMutation.isPending
      }
      className="rounded-lg bg-primary px-6 py-2 text-white disabled:opacity-50"
    >
      {isEditMode ? 'حفظ التعديلات' : 'حفظ القيد'}
    </button>
  </div>
);

export default JournalEntryFormActions;