import { useNavigate, useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import JournalEntryForm from '../../entries/components/journal-entry-form';
import { useJournalEntry } from '../../entries/hooks/entries.queries';
import InvoiceForm from '../components/invoice-form';
import { useUpdateInvoice } from '../hooks/invoices.mutations';
import { useInvoice } from '../hooks/invoices.queries';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: invoice, isLoading: isFetching } = useInvoice(id);

  const journalEntryId =
    invoice?.journalEntryID || invoice?.journalEntry?.journalEntryID || null;

  const { data: journalEntry, isLoading: isLoadingJournalEntry } =
    useJournalEntry(journalEntryId);

  const updateInvoiceMutation = useUpdateInvoice();

  const handleUpdate = async (data) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        id,
        ...data,
      });

      navigate('/invoices'); // adjust if needed
    } catch (error) {
      console.error(error);
    }
  };

  if (isFetching) {
    return <PageLoader label="جاري تحميل الفاتورة..." />;
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">تعديل الفاتورة</h1>
        <p className="mt-1 text-gray-500">
          قم بتحديث بيانات الفاتورة ثم احفظ التغييرات.
        </p>
      </div>

      <InvoiceForm
        initialData={invoice}
        onSubmit={handleUpdate}
        isLoading={updateInvoiceMutation.isPending}
      />

      {journalEntryId && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              القيد المرتبط بالفاتورة
            </h2>
            <p className="mt-1 text-gray-500">
              يظهر القيد اليومي المرتبط بهذه الفاتورة في أسفل الصفحة.
            </p>
          </div>

          {isLoadingJournalEntry ? (
            <PageLoader label="جاري تحميل القيد المرتبط..." />
          ) : journalEntry ? (
            <JournalEntryForm
              defaultValues={journalEntry}
              mode="edit"
              showEntryDetailsButton
            />
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              تعذر تحميل القيد المرتبط بهذه الفاتورة.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditInvoice;
