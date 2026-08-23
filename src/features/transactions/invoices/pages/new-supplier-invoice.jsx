import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateInvoice } from '../hooks/invoices.mutations';
import InvoiceForm from '../components/invoice-form';

const NewSupplierInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = searchParams.get('type');
  const redirectPath =
    type === 'customer' ? '/customers-invoices' : '/suppliers-invoices';
  const createInvoiceMutation = useCreateInvoice();

  const handleCreate = async (data) => {
    try {
      await createInvoiceMutation.mutateAsync(data);
      navigate(redirectPath);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const typeLabel = type === 'customer' ? 'عميل' : 'مورد';

  return (
    <div className="space-y-8 p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <ArrowLeft
          className="cursor-pointer text-gray-500 hover:text-gray-800"
          onClick={() => navigate(redirectPath)}
        />
        <div>
          <h1 className="text-2xl font-bold">إنشاء فاتورة جديدة - {typeLabel}</h1>
          <p className="text-sm text-gray-600">إضافة فاتورة {typeLabel} جديدة إلى النظام</p>
        </div>
      </div>

      <InvoiceForm
        invoiceType={type}
        onSubmit={handleCreate}
        isLoading={createInvoiceMutation.isPending}
      />
    </div>
  );
};

export default NewSupplierInvoice;
