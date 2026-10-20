// New customer invoice page.

import Breadcrumb from '../../../../shared/ui/breadcrumb';
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
      <Breadcrumb
        items={[
          { label: 'فواتير العملاء', to: redirectPath },
          { label: 'إنشاء فاتورة جديدة' },
        ]}
      />
      <header className="rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-6 text-white sm:px-8">
        <h1 className="text-2xl font-bold">إنشاء فاتورة جديدة - {typeLabel}</h1>
        <p className="mt-1 text-white/80">
          إضافة فاتورة {typeLabel} جديدة إلى النظام
        </p>
      </header>

      <InvoiceForm
        invoiceType={type}
        onSubmit={handleCreate}
        isLoading={createInvoiceMutation.isPending}
      />
    </div>
  );
};

export default NewCustomerInvoice;
