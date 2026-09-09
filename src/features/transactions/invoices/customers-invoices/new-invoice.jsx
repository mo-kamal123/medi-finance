// New customer invoice page.

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '../shared/hooks/invoices.mutations';
import InvoiceForm from '../shared/components/invoice-form';

const type = 'customer';
const redirectPath = '/customers-invoices';

const NewCustomerInvoice = () => {
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoice();

  const handleCreate = async (data) => {
    try {
      await createInvoiceMutation.mutateAsync(data);
      navigate(redirectPath);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const typeLabel = 'عميل';

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold">
            إنشاء فاتورة جديدة - {typeLabel}
          </h1>
          <p className="mt-0.5 text-gray-500">
            إضافة فاتورة {typeLabel} جديدة إلى النظام
          </p>
        </div>

        <div className="p-6">
          <InvoiceForm
            invoiceType={type}
            onSubmit={handleCreate}
            isLoading={createInvoiceMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default NewCustomerInvoice;
