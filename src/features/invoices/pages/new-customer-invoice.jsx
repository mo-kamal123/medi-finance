import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateInvoice } from '../hooks/invoices.mutations';
import InvoiceForm from '../components/invoice-form';

const NewSupplierInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = searchParams.get('type'); // 'customer' | 'supplier'
  const redirectPath = type === 'customer' ? '/customers-invoices' : '/suppliers-invoices';

  const createInvoiceMutation = useCreateInvoice();

  const handleCreate = async (data) => {
    try {
      await createInvoiceMutation.mutateAsync(data);
      navigate(redirectPath);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">
        إنشاء فاتورة جديدة ({type})
      </h1>

      <InvoiceForm
        invoiceType={type}
        onSubmit={handleCreate}
        isLoading={createInvoiceMutation.isLoading}
      />
    </div>
  );
};

export default NewSupplierInvoice;