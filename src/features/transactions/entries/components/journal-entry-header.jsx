import { CheckCircle2, ExternalLink, RotateCcw } from 'lucide-react';

// Page header with title, entry actions (view/post/reverse)
const JournalEntryHeader = ({
  navigate,
  isEditMode,
  entryId,
  showEntryDetailsButton = false,
  viewOnly = false,
  postMutation,
  reverseMutation,
  isPosted,
  isReversed,
  handlePostEntry,
  handleReverseEntry,
}) => {
  if (!viewOnly) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className='flex flex-col gap-1'>
            <h1 className="text-xl font-bold md:text-2xl">
              {isEditMode ? 'تعديل قيد يومي' : 'إنشاء قيد يومي'}
            </h1>
            <p className="text-sm text-gray-600">
              يجب أن يكون مجموع المدين مساوياً للدائن
            </p>
          </div>
        </div>

        {isEditMode ? (
          <div className="flex flex-wrap items-center gap-3">
            {showEntryDetailsButton && entryId ? (
              <button
                type="button"
                onClick={() => navigate(`/entries/${entryId}`)}
                className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700"
              >
                <ExternalLink size={16} />
                فتح صفحة القيد
              </button>
            ) : null}
            <button
              type="button"
              onClick={handlePostEntry}
              disabled={
                postMutation.isPending ||
                reverseMutation.isPending ||
                isPosted ||
                isReversed
              }
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              ترحيل القيد
            </button>
            <button
              type="button"
              onClick={handleReverseEntry}
              disabled={
                postMutation.isPending ||
                reverseMutation.isPending ||
                !isPosted ||
                isReversed
              }
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} />
              عكس القيد
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (showEntryDetailsButton && entryId) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate(`/entries/${entryId}`)}
          className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700 hover:bg-sky-100"
        >
          <ExternalLink size={16} />
          فتح صفحة القيد
        </button>
      </div>
    );
  }

  return null;
};

export default JournalEntryHeader;