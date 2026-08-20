import Breadcrumb from '../../../shared/ui/breadcrumb';
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
      <BankForm />
    </div>
  );
};

export default NewBank;
