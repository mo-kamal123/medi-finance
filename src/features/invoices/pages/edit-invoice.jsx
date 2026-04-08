import { useNavigate, useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import InvoiceForm from '../components/invoice-form';
import { useUpdateInvoice } from '../hooks/invoices.mutations';
import { useInvoice } from '../hooks/invoices.queries';

const getRedirectPath = (invoice) => {
  if (invoice?.customerID) {
    return '/customers-invoices';
  }

  return '/suppliers-invoices';
};

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading: isFetching } = useInvoice(id);
  const updateInvoiceMutation = useUpdateInvoice();

  const handleUpdate = async (data) => {
    try {
      await updateInvoiceMutation.mutateAsync({ id, ...data });
      navigate(getRedirectPath(invoice));
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  if (isFetching) {
    return <PageLoader label="جاري تحميل الفاتورة..." />;
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6 md:p-10">
      <h1 className="text-3xl font-bold text-gray-900">تعديل الفاتورة</h1>
      <p className="mt-1 text-gray-500">
        قم بتحديث بيانات الفاتورة ثم احفظ التغييرات.
      </p>

      <InvoiceForm
        initialData={invoice}
        onSubmit={handleUpdate}
        isLoading={updateInvoiceMutation.isPending}
      />
    </div>
  );
};

export default EditInvoice;
