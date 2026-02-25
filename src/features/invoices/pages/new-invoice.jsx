import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '../hooks/invoices.mutations';
import InvoiceForm from '../components/invoice-form';

const NewInvoice = () => {
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoice();

  const handleCreate = async (data) => {
    try {
      await createInvoiceMutation.mutateAsync(data);
      navigate('/invoices'); // redirect after success
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">إنشاء فاتورة جديدة</h1>
      <p className="text-gray-500 mt-1">
        أدخل بيانات الفاتورة الجديدة وحفظها بسهولة
      </p>

      <InvoiceForm
        onSubmit={handleCreate}
        isLoading={createInvoiceMutation.isLoading}
      />
    </div>
  );
};

export default NewInvoice;
