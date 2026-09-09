import { CheckCircle2, Eye, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '../../../../shared/lib/toast';
import {
  usePostJournalEntry,
  useReverseJournalEntry,
} from '../hooks/entries.mutations';
import {
  isJournalEntryPosted,
  isJournalEntryReversed,
} from '../utils/journal-entry.utils';

const JournalEntryActions = ({ entry }) => {
  // Mutations for posting and reversing the current journal entry
  const postMutation = usePostJournalEntry();
  const reverseMutation = useReverseJournalEntry();

  const isPosting =
    postMutation.isPending && postMutation.variables?.id === entry.journalEntryID;
  const isReversing =
    reverseMutation.isPending &&
    reverseMutation.variables?.id === entry.journalEntryID;
  const isPosted = isJournalEntryPosted(entry);
  const isReversed = isJournalEntryReversed(entry);

  // Post the entry after guarding against already posted/reversed states
  const handlePostEntry = () => {
    if (isJournalEntryPosted(entry)) {
      toast.info('تم ترحيل هذا القيد بالفعل');
      return;
    }

    if (isJournalEntryReversed(entry)) {
      toast.info('لا يمكن ترحيل قيد تم عكسه');
      return;
    }

    postMutation.mutate({ id: entry.journalEntryID, postedBy: 'ms' });
  };

  // Reverse the entry after guarding against already reversed/not posted states
  const handleReverseEntry = () => {
    if (isJournalEntryReversed(entry)) {
      toast.info('تم عكس هذا القيد بالفعل');
      return;
    }

    if (!isJournalEntryPosted(entry)) {
      toast.info('يجب ترحيل القيد أولاً قبل إجراء العكس');
      return;
    }

    reverseMutation.mutate({ id: entry.journalEntryID, reversedBy: 'ms' });
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Link
        to={`/entries/${entry.journalEntryID}`}
        className="text-blue-600 transition-colors hover:text-blue-800"
        title="عرض"
      >
        <Eye size={18} />
      </Link>

      <button
        type="button"
        onClick={handlePostEntry}
        disabled={isPosting || isReversing || isPosted || isReversed}
        className="text-emerald-600 transition-colors hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
        title="ترحيل"
      >
        <CheckCircle2 size={18} />
      </button>

      <button
        type="button"
        onClick={handleReverseEntry}
        disabled={isPosting || isReversing || !isPosted || isReversed}
        className="text-amber-600 transition-colors hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
        title="عكس القيد"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
};

export default JournalEntryActions;
