import Breadcrumb from '../../../../shared/ui/breadcrumb';
import JournalEntryForm from '../components/journal-entry-form';

const NewJournalEntryPage = () => {
  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'القيود اليومية', to: '/entries' },
          { label: 'إضافة قيد جديد' },
        ]}
      />
      <JournalEntryForm mode="create" />
    </div>
  );
};

export default NewJournalEntryPage;
