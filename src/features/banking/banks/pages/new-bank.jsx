import Breadcrumb from '../../../../shared/ui/breadcrumb';
import BankForm from '../components/bank-form';

const NewBank = () => {
  return (
    <div className="space-y-4 p-6">
      <Breadcrumb
        items={[
          { label: 'البنوك', to: '/banks' },
          { label: 'إضافة بنك' },
        ]}
      />
      <header className="rounded-2xl border border-main bg-main p-6 text-white">
        <h1 className="text-2xl font-bold">إضافة بنك</h1>
        <p className="mt-1 text-sm text-white/70">إدخال بيانات بنك جديد</p>
      </header>
      <BankForm />
    </div>
  );
};

export default NewBank;
