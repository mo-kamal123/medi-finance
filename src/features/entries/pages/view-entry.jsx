import { useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import JournalEntryForm from '../components/journal-entry-form';
import { useJournalEntry } from '../hooks/entries.queries';

const ViewJournalEntryPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useJournalEntry(id);

  if (isLoading) {
    return <PageLoader label="جاري تحميل القيد اليومي..." />;
  }

  if (!data) {
    return <div>لا توجد بيانات.</div>;
  }

  return <JournalEntryForm defaultValues={data} mode="edit" />;
};

export default ViewJournalEntryPage;
