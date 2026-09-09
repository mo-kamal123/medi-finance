import { useParams } from 'react-router-dom';
import PageLoader from '../../../../shared/ui/page-loader';
import NotFound from '../../../../shared/ui/not-found';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
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
      <NotFound label="تعذر تحميل بيانات القيد اليومي." />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'القيود اليومية', to: '/entries' },
          {
            label: data.journalEntryNumber || `قيد ${id}`,
          },
        ]}
      />
      <JournalEntryForm defaultValues={data} mode="edit" />
    </div>
  );
};

export default ViewJournalEntryPage;
