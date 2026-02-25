// EditInvoice.jsx
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateInvoice } from '../hooks/invoices.mutations';
import InvoiceForm from '../components/invoice-form';
import { useInvoice } from '../hooks/invoices.queries';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch existing invoice
  const { data: invoice, isLoading: isFetching } = useInvoice(id);

  // Mutation for updating
  const updateInvoiceMutation = useUpdateInvoice();

  const handleUpdate = async (data) => {
    try {
      // Send payload exactly as API expects
      await updateInvoiceMutation.mutateAsync({ id, ...data });
      navigate('/invoices'); // redirect after update
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  if (isFetching) return <div>جارٍ تحميل البيانات...</div>;

  return (
    <div className="space-y-8 p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">تعديل الفاتورة</h1>
      <p className="text-gray-500 mt-1">
        قم بتحديث بيانات الفاتورة وحفظ التغييرات
      </p>

      <InvoiceForm
        initialData={invoice}
        onSubmit={handleUpdate}
        isLoading={updateInvoiceMutation.isLoading}
      />
    </div>
  );
};

export default EditInvoice;
