import { BookOpen, CheckCircle2, ExternalLink, RotateCcw } from 'lucide-react';

import { formatDate } from '../../../../shared/utils/formatters';
import { getJournalEntryStatusMeta } from '../utils/journal-entry.utils';

// Page header with title, entry actions (view/post/reverse)
const JournalEntryHeader = ({
  navigate,
  isEditMode,
  entryId,
  entryNumber,
  entryDate,
  entryStatus,
  showEntryDetailsButton = false,
  viewOnly = false,
  postMutation,
  reverseMutation,
  isPosted,
  isReversed,
  handlePostEntry,
  handleReverseEntry,
}) => {
  const statusMeta = getJournalEntryStatusMeta({ statusName: entryStatus });

  if (!viewOnly) {
    return (
      <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${isEditMode ? 'rounded-2xl bg-linear-to-r from-primary to-primary/80 px-4 py-6 text-white md:px-8' : 'rounded-2xl border border-main bg-main p-4 text-white md:p-6'}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {isEditMode ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white shadow-inner">
              <BookOpen size={20} />
            </div>
          ) : null}
          <div className='flex flex-col gap-1'>
            <h1 className="text-xl font-bold md:text-2xl">
              {isEditMode ? `قيد ${entryNumber || entryId}` : 'إنشاء قيد يومي'}
            </h1>
            {isEditMode ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-white/70">التاريخ: {formatDate(entryDate)}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
              </div>
            ) : (
              <p className="text-sm text-white/70">
                يجب أن يكون مجموع المدين مساوياً للدائن
              </p>
            )}
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
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-600 transition-colors hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
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
