import { useParams } from 'react-router-dom';
import PageLoader from '../../../../shared/ui/page-loader';
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
      <div className="p-6 text-center text-gray-600">
        تعذر تحميل بيانات القيد اليومي.
      </div>
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
