import { useParams } from 'react-router-dom';
import PageLoader from '../../../../shared/ui/page-loader';
import JournalEntryForm from '../components/journal-entry-form';
import { useJournalEntry } from '../hooks/entries.queries';

const ViewJournalEntryPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useJournalEntry(id);

  if (isLoading) {
    return <PageLoader label="جاري تحميل القيد اليومي..." />;
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-gray-600">
        تعذر تحميل بيانات القيد اليومي.
      </div>
    );
  }

  return <JournalEntryForm defaultValues={data} mode="edit" />;
};

export default ViewJournalEntryPage;
