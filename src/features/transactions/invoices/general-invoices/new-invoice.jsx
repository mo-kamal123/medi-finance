import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import { useCreateInvoice } from '../shared/hooks/invoices.mutations';
import GeneralInvoiceForm from './general-invoice-form';

const NewGeneralInvoice = () => {
  const navigate = useNavigate();
  const mutation = useCreateInvoice();
  const handleCreate = async (payload) => {
    try {
      await mutation.mutateAsync(payload);
      navigate('/general-invoices');
    } catch {
      // The mutation displays the server error and preserves the form.
    }
  };
  return (
    <div className="min-w-0 space-y-6 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: 'الفواتير العامة', to: '/general-invoices' },
          { label: 'إنشاء فاتورة عامة' },
        ]}
      />
      <header className="rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-6 text-white">
        <h1 className="text-2xl font-bold">إنشاء فاتورة عامة</h1>
        <p className="mt-1 text-white/80">
          تسجيل المصروفات على الحسابات والدفع نقداً أو من البنك
        </p>
      </header>
      <GeneralInvoiceForm
        onSubmit={handleCreate}
        isLoading={mutation.isPending}
      />
    </div>
  );
};
export default NewGeneralInvoice;
